// ============================================================
//  PointFit — Logique principale (app.js)
//  Dépendances : Firebase SDK (module), foods.js (FOODS_DB)
// ============================================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut as fbSignOut, onAuthStateChanged, updateProfile
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  getFirestore, doc, setDoc, getDoc, onSnapshot,
  collection, query, orderBy, addDoc, deleteDoc
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ════════════════════════════════════════
//  🔥 FIREBASE CONFIG
//  Remplacer par vos propres valeurs Firebase
// ════════════════════════════════════════
const firebaseConfig = {
  apiKey:            "VOTRE_API_KEY",
  authDomain:        "VOTRE_PROJECT.firebaseapp.com",
  projectId:         "VOTRE_PROJECT_ID",
  storageBucket:     "VOTRE_PROJECT.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId:             "VOTRE_APP_ID"
};

// Détecte si la config Firebase est factice (mode démo forcé)
const FIREBASE_CONFIGURED = firebaseConfig.apiKey !== "VOTRE_API_KEY";

let fbApp = null, auth = null, db = null;

function hideSplash() {
  const splash = document.getElementById('splash');
  splash.classList.add('hide');
  splash.style.display = 'none';
}

function showAuth() {
  hideSplash();
  document.getElementById('auth-screen').classList.remove('hidden');
}

if (FIREBASE_CONFIGURED) {
  try {
    fbApp = initializeApp(firebaseConfig);
    auth  = getAuth(fbApp);
    db    = getFirestore(fbApp);
  } catch (e) {
    console.warn('Firebase init failed:', e);
    showAuth();
  }
} else {
  // Config factice → on saute directement l'écran auth après un court splash
  setTimeout(showAuth, 800);
}

// ════════════════════════════════════════
//  STATE
// ════════════════════════════════════════
let currentUser  = null;
let isDemoMode   = false;
let profile      = { budget: 23, weight: 0, goal: 0, age: 30, sex: 'f', activity: '1' };
let library      = [];
let journal      = {};   // { "YYYY-MM-DD": { meals: { repas: [items] } } }
let weights      = [];   // [{ id, date, value, ts }]
let currentMeal  = 'petit-dejeuner';
let journalOffset = 0;   // 0 = aujourd'hui, -1 = hier, etc.
let unsubJournal = null, unsubWeights = null, unsubProfile = null, unsubLibrary = null;

// ════════════════════════════════════════
//  UTILS
// ════════════════════════════════════════
function todayStr(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}

function formatDate(str) {
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}

// ── Formule SmartPoints inspirée WW ──
// Points = (cal × 0.0305) + (sat × 0.275) + (sugar × 0.12) − (prot × 0.098) − (fiber × 0.07)
function calcPts(cal = 0, prot = 0, sat = 0, sugar = 0, fiber = 0) {
  const raw = (cal * 0.0305) + (sat * 0.275) + (sugar * 0.12)
            - (prot * 0.098) - (fiber * 0.07);
  return Math.max(0, Math.round(raw));
}

// ── Budget journalier personnalisé ──
function calcBudget(weight, age, sex, activity) {
  let base = sex === 'm' ? 26 : 23;
  if (weight > 90)      base += 4;
  else if (weight > 75) base += 2;
  else if (weight > 60) base += 1;
  if (age < 25)         base += 2;
  else if (age > 55)    base -= 1;
  base += parseInt(activity) - 1;
  return Math.max(18, Math.min(45, base));
}

// ════════════════════════════════════════
//  DEMO MODE
// ════════════════════════════════════════
function launchDemo() {
  isDemoMode  = true;
  currentUser = { uid: 'demo', displayName: 'Utilisateur Démo', email: 'demo@pointfit.app' };
  profile     = { budget: 26, weight: 78, goal: 70, age: 32, sex: 'm', activity: '2' };

  // Journal démo pré-rempli
  const t = todayStr();
  const y = todayStr(-1);

  journal[t] = { meals: {
    'petit-dejeuner': [
      { name: "Flocons d'avoine", cal: 150, prot: 5,  sat: 0.5, sugar: 2,   fiber: 3,   qty: 60,  pts: calcPts(90, 3, 0.3, 1.2, 1.8) },
      { name: 'Banane',           cal: 89,  prot: 1.1, sat: 0.1, sugar: 12,  fiber: 2.6, qty: 100, pts: 0 },
    ],
    'dejeuner': [
      { name: 'Blanc de poulet grillé', cal: 165, prot: 31, sat: 1,   sugar: 0, fiber: 0,   qty: 150, pts: calcPts(248, 46.5, 1.5, 0, 0) },
      { name: 'Riz blanc cuit',         cal: 130, prot: 2.7, sat: 0.1, sugar: 0, fiber: 0.4, qty: 150, pts: calcPts(195, 4,    0.15, 0, 0.6) },
      { name: 'Salade verte',           cal: 15,  prot: 1.3, sat: 0,   sugar: 1, fiber: 1.5, qty: 80,  pts: 0 },
    ],
    'collation': [
      { name: 'Yaourt nature 0%', cal: 56, prot: 8, sat: 0.1, sugar: 6, fiber: 0, qty: 125, pts: calcPts(70, 10, 0.1, 7.5, 0) },
    ],
    'diner': [],
  }};

  journal[y] = { meals: {
    'petit-dejeuner': [
      { name: 'Pain complet', cal: 70, prot: 3, sat: 0.3, sugar: 1.5, fiber: 2, qty: 40, pts: calcPts(28, 1.2, 0.12, 0.6, 0.8) },
    ],
    'dejeuner': [
      { name: 'Saumon grillé',  cal: 208, prot: 20, sat: 3,   sugar: 0,   fiber: 0,   qty: 120, pts: calcPts(250, 24, 3.6, 0, 0) },
      { name: 'Brocolis vapeur', cal: 35,  prot: 2.8, sat: 0, sugar: 1.7, fiber: 2.6, qty: 100, pts: 0 },
    ],
    'diner': [
      { name: 'Omelette 2 œufs', cal: 148, prot: 12, sat: 2.8, sugar: 0.4, fiber: 0, qty: 110, pts: calcPts(163, 13.2, 3.1, 0.44, 0) },
    ],
    'collation': [],
  }};

  // Bibliothèque démo (tirée de FOODS_DB)
  library = FOODS_DB.slice(0, 12).map((f, i) => ({
    id:      'demo_' + i,
    name:    f.name,
    emoji:   f.emoji,
    cal:     f.cal,
    prot:    f.prot,
    sat:     f.sat,
    sugar:   f.sugar,
    fiber:   f.fiber,
    portion: f.portion,
    pts:     calcPts(f.cal, f.prot, f.sat, f.sugar, f.fiber),
  }));

  // Historique de poids démo (30 jours)
  const base = new Date();
  base.setDate(base.getDate() - 30);
  const wVals = [80.2,79.8,79.5,79.6,79.1,78.9,78.7,79.0,78.5,78.3,78.0,78.2,
                 77.8,77.6,77.9,77.4,77.2,77.5,77.0,76.8,77.1,76.6,76.4,76.7,
                 76.2,76.0,76.3,75.9,75.7,78.0];
  weights = wVals.map((v, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    return { id: 'w' + i, date: d.toISOString().split('T')[0], value: v, ts: d.getTime() };
  });

  // Afficher l'app
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('demo-banner-app').style.display = 'block';
  document.getElementById('app').classList.add('visible');
  setupHeader();
  loadProfileUI();
  renderJournal();
  renderLibrary();
  renderWeights();
  updateHeader();
  toast('🎮 Bienvenue en mode démo !');
}

document.getElementById('demo-btn').onclick = launchDemo;

// ════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════
let authMode = 'login';

function toggleAuthMode() {
  authMode = authMode === 'login' ? 'register' : 'login';
  document.getElementById('auth-title').textContent  = authMode === 'login' ? 'Connexion' : 'Inscription';
  document.getElementById('auth-btn').textContent    = authMode === 'login' ? 'Se connecter' : 'Créer mon compte';
  document.getElementById('auth-switch').innerHTML   = authMode === 'login'
    ? "Pas de compte ? <span>S'inscrire</span>"
    : "Déjà un compte ? <span>Se connecter</span>";
  document.getElementById('auth-name').style.display = authMode === 'register' ? 'block' : 'none';
  document.getElementById('auth-error').classList.remove('show');
}
document.getElementById('auth-switch').onclick = toggleAuthMode;

document.getElementById('auth-btn').onclick = async () => {
  const email  = document.getElementById('auth-email').value.trim();
  const pwd    = document.getElementById('auth-password').value;
  const name   = document.getElementById('auth-name').value.trim();
  const errEl  = document.getElementById('auth-error');
  errEl.classList.remove('show');
  try {
    if (authMode === 'register') {
      const cred = await createUserWithEmailAndPassword(auth, email, pwd);
      if (name) await updateProfile(cred.user, { displayName: name });
    } else {
      await signInWithEmailAndPassword(auth, email, pwd);
    }
  } catch (e) {
    const msgs = {
      'auth/email-already-in-use':  'Email déjà utilisé.',
      'auth/invalid-email':         'Email invalide.',
      'auth/weak-password':         'Mot de passe trop court (6 caractères min).',
      'auth/user-not-found':        'Aucun compte avec cet email.',
      'auth/wrong-password':        'Mot de passe incorrect.',
      'auth/invalid-credential':    'Email ou mot de passe incorrect.',
    };
    errEl.textContent = msgs[e.code] || e.message;
    errEl.classList.add('show');
  }
};

window.signOut = async () => {
  if (isDemoMode) {
    isDemoMode    = false;
    currentUser   = null;
    journal       = {};
    library       = [];
    weights       = [];
    journalOffset = 0;
    document.getElementById('demo-banner-app').style.display = 'none';
    document.getElementById('app').classList.remove('visible');
    document.getElementById('auth-screen').classList.remove('hidden');
    return;
  }
  if (unsubJournal)  unsubJournal();
  if (unsubWeights)  unsubWeights();
  if (unsubProfile)  unsubProfile();
  if (unsubLibrary)  unsubLibrary();
  await fbSignOut(auth);
};

if (FIREBASE_CONFIGURED && auth) {
  // Timeout de secours : si Firebase ne répond pas en 5s, on affiche l'auth
  const splashTimeout = setTimeout(showAuth, 5000);

  onAuthStateChanged(auth, async user => {
    clearTimeout(splashTimeout);
    hideSplash();
    if (user) {
      currentUser = user;
      document.getElementById('auth-screen').classList.add('hidden');
      document.getElementById('app').classList.add('visible');
      setupHeader();
      subscribeData();
    } else if (!isDemoMode) {
      currentUser = null;
      document.getElementById('auth-screen').classList.remove('hidden');
      document.getElementById('app').classList.remove('visible');
    }
  });
}

// ════════════════════════════════════════
//  FIRESTORE — ABONNEMENTS TEMPS RÉEL
// ════════════════════════════════════════
function subscribeData() {
  const uid = currentUser.uid;

  // Profil utilisateur
  unsubProfile = onSnapshot(doc(db, 'users', uid, 'data', 'profile'), snap => {
    if (snap.exists()) {
      profile = { ...profile, ...snap.data() };
      loadProfileUI();
      updateHeader();
    }
  });

  // Bibliothèque personnelle
  unsubLibrary = onSnapshot(collection(db, 'users', uid, 'library'), snap => {
    library = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderLibrary();
  });

  // Journal du jour (chargement à la demande)
  loadJournalDay(todayStr());

  // Historique de poids
  unsubWeights = onSnapshot(
    query(collection(db, 'users', uid, 'weights'), orderBy('date', 'asc')),
    snap => {
      weights = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderWeights();
    }
  );
}

// ── Chargement d'un jour du journal ──
async function loadJournalDay(dateStr) {
  if (journal[dateStr] !== undefined) return;
  if (isDemoMode || !db) {
    journal[dateStr] = { meals: {} };
    renderJournal();
    updateHeader();
    return;
  }
  const uid  = currentUser.uid;
  const snap = await getDoc(doc(db, 'users', uid, 'journal', dateStr));
  journal[dateStr] = snap.exists() ? snap.data() : { meals: {} };
  renderJournal();
  updateHeader();
}

async function saveJournalDay(dateStr) {
  if (isDemoMode || !db) return;
  await setDoc(doc(db, 'users', currentUser.uid, 'journal', dateStr), journal[dateStr]);
}

async function saveProfileDb() {
  if (isDemoMode || !db) return;
  await setDoc(doc(db, 'users', currentUser.uid, 'data', 'profile'), profile);
}

// ════════════════════════════════════════
//  HEADER & ANNEAU DE POINTS
// ════════════════════════════════════════
function setupHeader() {
  const DAYS   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  const MONTHS = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
  const now    = new Date();
  document.getElementById('header-date').textContent =
    `${DAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]}`;
  document.getElementById('profile-display-name').textContent = currentUser.displayName || 'Mon profil';
  document.getElementById('profile-display-email').textContent = currentUser.email;
  if (currentUser.displayName) {
    document.getElementById('profile-avatar').textContent = currentUser.displayName[0].toUpperCase();
  }
}

function updateHeader() {
  const dateStr = todayStr();
  const dayData = journal[dateStr];
  let used = 0;
  if (dayData) {
    Object.values(dayData.meals || {}).forEach(items =>
      items.forEach(i => { used += i.pts || 0; })
    );
  }
  const budget    = profile.budget || 23;
  const remaining = budget - used;

  document.getElementById('ring-remaining').textContent = remaining;
  document.getElementById('stat-used').textContent      = used;
  document.getElementById('stat-budget').textContent    = budget;

  const pct  = Math.min(1, used / budget);
  const circ = 339.3;
  const fill = document.getElementById('ring-fill');
  fill.style.strokeDashoffset = circ * (1 - pct);
  fill.style.stroke = remaining < 3 ? '#e74c3c' : 'var(--yellow)';

  // Points bonus hebdomadaires
  const wUsed = getWeeklyExcessPts();
  document.getElementById('stat-weekly').textContent       = Math.max(0, 35 - wUsed);
  document.getElementById('weekly-used-label').textContent = `${wUsed} / 35`;
  document.getElementById('weekly-bar-fill').style.width   = Math.min(100, (wUsed / 35) * 100) + '%';
}

function getWeeklyExcessPts() {
  const now  = new Date();
  const day  = now.getDay() === 0 ? 6 : now.getDay() - 1; // lundi = 0
  let total  = 0;
  for (let i = 0; i <= day; i++) {
    const d      = new Date(now);
    d.setDate(d.getDate() - i);
    const str    = d.toISOString().split('T')[0];
    const dayData = journal[str];
    if (dayData) {
      Object.values(dayData.meals || {}).forEach(items =>
        items.forEach(item => { total += item.pts || 0; })
      );
    }
  }
  return Math.max(0, total - (profile.budget || 23) * (day + 1));
}

// ════════════════════════════════════════
//  JOURNAL ALIMENTAIRE
// ════════════════════════════════════════
const MEAL_LABELS = {
  'petit-dejeuner': '🌅 Petit-déjeuner',
  'dejeuner':       '🌞 Déjeuner',
  'diner':          '🌙 Dîner',
  'collation':      '🍎 Collation',
};
const MEAL_ORDER = ['petit-dejeuner', 'dejeuner', 'collation', 'diner'];

window.changeDay = (dir) => {
  journalOffset = Math.min(0, journalOffset + dir);
  const dateStr = todayStr(journalOffset);
  loadJournalDay(dateStr);
  const label = journalOffset === 0  ? "Aujourd'hui"
              : journalOffset === -1 ? "Hier"
              : formatDate(dateStr);
  document.getElementById('journal-day-label').textContent = label;
};

function renderJournal() {
  const dateStr = todayStr(journalOffset);
  const dayData = journal[dateStr] || { meals: {} };
  const cont    = document.getElementById('journal-content');
  let html  = '';
  let total = 0;

  MEAL_ORDER.forEach(meal => {
    const items = (dayData.meals || {})[meal] || [];
    const mPts  = items.reduce((s, i) => s + (i.pts || 0), 0);
    total += mPts;

    html += `<div class="meal-section">
      <div class="meal-header">
        <span class="meal-name">${MEAL_LABELS[meal]}</span>
        <span class="meal-pts">${mPts} pts</span>
      </div>`;

    if (items.length === 0) {
      html += `<div style="color:var(--text2);font-size:0.8rem;padding:4px 0 8px;font-style:italic">Rien ajouté</div>`;
    }
    items.forEach((item, idx) => {
      html += `<div class="food-item">
        <div class="food-item-info">
          <div class="food-item-name">${item.name}</div>
          <div class="food-item-detail">${item.qty || 100}g · ${item.cal || 0} kcal · P:${item.prot || 0}g</div>
        </div>
        <span class="food-item-pts ${item.pts === 0 ? 'zero' : ''}">${item.pts === 0 ? '🟢 0' : item.pts} pts</span>
        <button class="food-item-del" onclick="deleteJournalItem('${meal}', ${idx})">🗑</button>
      </div>`;
    });
    html += `</div>`;
  });

  cont.innerHTML = total === 0
    ? `<div class="empty-journal"><span class="empty-icon">📓</span>Commence à ajouter<br>tes repas !</div>`
    : html;

  if (journalOffset === 0) updateHeader();
}

window.deleteJournalItem = async (meal, idx) => {
  const dateStr = todayStr(journalOffset);
  if (!journal[dateStr]) return;
  journal[dateStr].meals[meal].splice(idx, 1);
  renderJournal();
  await saveJournalDay(dateStr);
  updateHeader();
  toast('Aliment supprimé');
};

// ════════════════════════════════════════
//  CALCULATEUR DE POINTS
// ════════════════════════════════════════
window.calcPoints = () => {
  const cal    = parseFloat(document.getElementById('c-cal').value)    || 0;
  const prot   = parseFloat(document.getElementById('c-prot').value)   || 0;
  const sat    = parseFloat(document.getElementById('c-sat').value)    || 0;
  const sugar  = parseFloat(document.getElementById('c-sugar').value)  || 0;
  const fiber  = parseFloat(document.getElementById('c-fiber').value)  || 0;
  const portion = parseFloat(document.getElementById('c-portion').value) || 100;
  const factor = portion / 100;
  const pts = calcPts(cal * factor, prot * factor, sat * factor, sugar * factor, fiber * factor);
  document.getElementById('calc-pts').textContent       = pts;
  document.getElementById('calc-pts-label').textContent = pts === 1 ? 'point' : 'points';
  document.getElementById('calc-zero-badge').innerHTML  = pts === 0 ? '<span class="zero-badge">🟢 ZeroPoint</span>' : '';
};

// ── Recherche dans la BDD aliments ──
window.searchFoodsDB = () => {
  const q       = (document.getElementById('foods-db-search').value || '').toLowerCase().trim();
  const results = document.getElementById('foods-db-results');
  if (q.length < 2) { results.innerHTML = ''; return; }

  const matches = FOODS_DB.filter(f =>
    f.name.toLowerCase().includes(q) || f.cat.toLowerCase().includes(q)
  ).slice(0, 10);

  if (matches.length === 0) {
    results.innerHTML = `<div style="color:var(--text2);font-size:0.85rem;padding:8px">Aucun résultat pour "${q}"</div>`;
    return;
  }
  results.innerHTML = matches.map((f, i) => {
    const pts = calcPts(f.cal, f.prot, f.sat, f.sugar, f.fiber);
    return `<div class="food-db-item" onclick="loadFoodFromDB(${FOODS_DB.indexOf(f)})">
      <div class="food-db-emoji">${f.emoji}</div>
      <div class="food-db-info">
        <div class="food-db-name">${f.name}</div>
        <div class="food-db-meta">${f.cal} kcal · P:${f.prot}g · Sat:${f.sat}g · ${f.portion}g</div>
      </div>
      <div class="food-db-pts ${pts === 0 ? 'zero' : ''}">${pts === 0 ? '🟢 0' : pts} pts</div>
    </div>`;
  }).join('');
};

window.loadFoodFromDB = (idx) => {
  const f = FOODS_DB[idx];
  if (!f) return;
  document.getElementById('c-name').value    = f.name;
  document.getElementById('c-cal').value     = f.cal;
  document.getElementById('c-prot').value    = f.prot;
  document.getElementById('c-sat').value     = f.sat;
  document.getElementById('c-sugar').value   = f.sugar;
  document.getElementById('c-fiber').value   = f.fiber;
  document.getElementById('c-portion').value = f.portion;
  document.getElementById('foods-db-search').value = '';
  document.getElementById('foods-db-results').innerHTML = '';
  calcPoints();
  toast(`📋 ${f.name} chargé`);
};

// ── Modal d'ajout au journal ──
let modalCalcData = {};

window.openAddModal = () => {
  const cal  = parseFloat(document.getElementById('c-cal').value) || 0;
  const name = document.getElementById('c-name').value;
  if (cal === 0 && !name) { toast('Remplis au moins les calories'); return; }

  modalCalcData = {
    name:        name || 'Aliment',
    cal:         parseFloat(document.getElementById('c-cal').value)    || 0,
    prot:        parseFloat(document.getElementById('c-prot').value)   || 0,
    sat:         parseFloat(document.getElementById('c-sat').value)    || 0,
    sugar:       parseFloat(document.getElementById('c-sugar').value)  || 0,
    fiber:       parseFloat(document.getElementById('c-fiber').value)  || 0,
    basePortion: parseFloat(document.getElementById('c-portion').value) || 100,
  };
  document.getElementById('modal-qty').value = modalCalcData.basePortion;
  updateModalPts();
  document.getElementById('add-modal').classList.remove('hidden');
};

window.closeModal = () => document.getElementById('add-modal').classList.add('hidden');

window.updateModalPts = () => {
  const qty = parseFloat(document.getElementById('modal-qty').value) || 100;
  const f   = qty / 100;
  const pts = calcPts(
    modalCalcData.cal   * f,
    modalCalcData.prot  * f,
    modalCalcData.sat   * f,
    modalCalcData.sugar * f,
    modalCalcData.fiber * f
  );
  const el = document.getElementById('modal-pts-display');
  el.textContent  = pts + ' pts';
  el.dataset.pts  = pts;
};

window.selectMeal = (meal, el) => {
  currentMeal = meal;
  document.querySelectorAll('.meal-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
};

window.confirmAddToJournal = async () => {
  const qty = parseFloat(document.getElementById('modal-qty').value) || 100;
  const f   = qty / 100;
  const pts = calcPts(
    modalCalcData.cal   * f,
    modalCalcData.prot  * f,
    modalCalcData.sat   * f,
    modalCalcData.sugar * f,
    modalCalcData.fiber * f
  );
  const dateStr = todayStr(journalOffset);
  if (!journal[dateStr]) journal[dateStr] = { meals: {} };
  if (!journal[dateStr].meals[currentMeal]) journal[dateStr].meals[currentMeal] = [];

  journal[dateStr].meals[currentMeal].push({
    name:  modalCalcData.name,
    cal:   Math.round(modalCalcData.cal   * f),
    prot:  Math.round(modalCalcData.prot  * f * 10) / 10,
    sat:   Math.round(modalCalcData.sat   * f * 10) / 10,
    sugar: Math.round(modalCalcData.sugar * f * 10) / 10,
    fiber: Math.round(modalCalcData.fiber * f * 10) / 10,
    qty:   Math.round(qty),
    pts,
  });

  window.closeModal();
  renderJournal();
  updateHeader();
  await saveJournalDay(dateStr);
  toast(`✅ Ajouté ! (${pts} pt${pts > 1 ? 's' : ''})`);
  showPage('journal');
};

// ════════════════════════════════════════
//  BIBLIOTHÈQUE PERSONNELLE
// ════════════════════════════════════════
function getEmoji(name) {
  const MAP = {
    pain:'🍞', riz:'🍚', pâtes:'🍝', poulet:'🍗', poisson:'🐟',
    saumon:'🐟', thon:'🐟', salade:'🥗', pomme:'🍎', banane:'🍌',
    yaourt:'🥛', fromage:'🧀', oeuf:'🥚', oeuf:'🥚', chocolat:'🍫',
    café:'☕', eau:'💧', lait:'🥛', tomate:'🍅', carotte:'🥕',
    brocoli:'🥦', dinde:'🍗', boeuf:'🥩', veau:'🥩', agneau:'🥩',
    porc:'🥩', jambon:'🥩', crevette:'🦐', avoine:'🌾',
  };
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(MAP)) {
    if (lower.includes(k)) return v;
  }
  return '🍽️';
}

window.saveToLibrary = async () => {
  const name = document.getElementById('c-name').value.trim();
  if (!name) { toast("Donne un nom à l'aliment d'abord"); return; }
  const item = {
    name,
    emoji:   getEmoji(name),
    cal:     parseFloat(document.getElementById('c-cal').value)    || 0,
    prot:    parseFloat(document.getElementById('c-prot').value)   || 0,
    sat:     parseFloat(document.getElementById('c-sat').value)    || 0,
    sugar:   parseFloat(document.getElementById('c-sugar').value)  || 0,
    fiber:   parseFloat(document.getElementById('c-fiber').value)  || 0,
    portion: parseFloat(document.getElementById('c-portion').value) || 100,
    savedAt: Date.now(),
  };
  item.pts = calcPts(item.cal, item.prot, item.sat, item.sugar, item.fiber);

  if (isDemoMode) {
    item.id = 'demo_' + Date.now();
    library.push(item);
    renderLibrary();
    toast('💾 Aliment sauvegardé (démo) !');
    return;
  }
  await addDoc(collection(db, 'users', currentUser.uid, 'library'), item);
  toast('💾 Aliment sauvegardé !');
};

function renderLibrary() {
  const search   = (document.getElementById('lib-search')?.value || '').toLowerCase();
  const filtered = library.filter(i => i.name.toLowerCase().includes(search));
  const list     = document.getElementById('library-list');
  const empty    = document.getElementById('library-empty');

  if (filtered.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  list.innerHTML = filtered.map(item => `
    <div class="lib-item" onclick="loadFromLibrary('${item.id}')">
      <div class="lib-item-emoji">${item.emoji || '🍽️'}</div>
      <div class="lib-item-info">
        <div class="lib-item-name">${item.name}</div>
        <div style="font-size:0.72rem;color:var(--text2)">${item.cal || 0} kcal · P:${item.prot || 0}g · ${item.portion || 100}g</div>
      </div>
      <div class="lib-item-pts">${item.pts} pts</div>
      <button class="lib-item-del" onclick="event.stopPropagation();deleteLibItem('${item.id}')">🗑</button>
    </div>
  `).join('');
}

window.loadFromLibrary = (id) => {
  const item = library.find(i => i.id === id);
  if (!item) return;
  document.getElementById('c-name').value    = item.name;
  document.getElementById('c-cal').value     = item.cal    || 0;
  document.getElementById('c-prot').value    = item.prot   || 0;
  document.getElementById('c-sat').value     = item.sat    || 0;
  document.getElementById('c-sugar').value   = item.sugar  || 0;
  document.getElementById('c-fiber').value   = item.fiber  || 0;
  document.getElementById('c-portion').value = item.portion || 100;
  calcPoints();
  showPage('calc');
  toast(`📋 ${item.name} chargé`);
};

window.deleteLibItem = async (id) => {
  if (isDemoMode) {
    library = library.filter(i => i.id !== id);
    renderLibrary();
    toast('Aliment supprimé');
    return;
  }
  await deleteDoc(doc(db, 'users', currentUser.uid, 'library', id));
  toast('Aliment supprimé');
};

// ════════════════════════════════════════
//  SUIVI DU POIDS
// ════════════════════════════════════════
window.addWeight = async () => {
  const val = parseFloat(document.getElementById('weight-input').value);
  if (!val || val < 30 || val > 300) { toast('Poids invalide'); return; }

  if (isDemoMode) {
    weights.push({ id: 'dw_' + Date.now(), date: todayStr(), value: val, ts: Date.now() });
    renderWeights();
    document.getElementById('weight-input').value = '';
    toast(`⚖️ ${val} kg enregistré (démo)`);
    return;
  }
  await addDoc(
    collection(db, 'users', currentUser.uid, 'weights'),
    { date: todayStr(), value: val, ts: Date.now() }
  );
  document.getElementById('weight-input').value = '';
  toast(`⚖️ ${val} kg enregistré`);
};

function renderWeights() {
  const hist      = document.getElementById('weight-history');
  const empty     = document.getElementById('weight-empty');
  const statsCard = document.getElementById('weight-stats-card');

  if (weights.length === 0) {
    hist.innerHTML      = '';
    empty.style.display = 'block';
    statsCard.style.display = 'none';
    return;
  }
  empty.style.display     = 'none';
  statsCard.style.display = 'block';

  const sorted  = [...weights].sort((a, b) => b.ts - a.ts);
  const first   = weights[0].value;
  const last    = sorted[0].value;
  const diff    = last - first;

  document.getElementById('ws-start').textContent   = first + ' kg';
  document.getElementById('ws-current').textContent = last  + ' kg';

  const diffEl = document.getElementById('ws-diff');
  diffEl.textContent  = (diff >= 0 ? '+' : '') + diff.toFixed(1) + ' kg';
  diffEl.style.color  = diff <= 0 ? 'var(--green)' : '#e74c3c';

  hist.innerHTML = sorted.slice(0, 10).map((w, idx) => {
    const prev = sorted[idx + 1];
    const d    = prev ? w.value - prev.value : 0;
    return `<div class="weight-entry">
      <div>
        <div class="weight-val">${w.value} kg</div>
        <div class="weight-date">${formatDate(w.date)}</div>
      </div>
      ${prev
        ? `<div class="weight-diff ${d <= 0 ? 'good' : 'bad'}">${d > 0 ? '+' : ''}${d.toFixed(1)} kg</div>`
        : '<div></div>'}
    </div>`;
  }).join('');

  drawWeightChart();
}

function drawWeightChart() {
  if (weights.length < 2) return;
  const sorted = [...weights].sort((a, b) => a.ts - b.ts).slice(-15);
  const vals   = sorted.map(w => w.value);
  const min    = Math.min(...vals) - 1;
  const max    = Math.max(...vals) + 1;
  const W = 300, H = 100;

  const pts = sorted.map((w, i) => {
    const x = (i / (sorted.length - 1)) * W;
    const y = H - ((w.value - min) / (max - min)) * H;
    return `${x},${y}`;
  });

  document.getElementById('weight-svg').innerHTML = `
    <defs>
      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#FF6B35"/>
        <stop offset="100%" stop-color="#FF6B35" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <polyline class="chart-line" points="${pts.join(' ')}"/>
    ${pts.map(p => `<circle class="chart-dot" cx="${p.split(',')[0]}" cy="${p.split(',')[1]}" r="3"/>`).join('')}
  `;
}

// ════════════════════════════════════════
//  PROFIL
// ════════════════════════════════════════
function loadProfileUI() {
  document.getElementById('p-weight').value   = profile.weight   || '';
  document.getElementById('p-goal').value     = profile.goal     || '';
  document.getElementById('p-age').value      = profile.age      || '';
  document.getElementById('p-sex').value      = profile.sex      || 'f';
  document.getElementById('p-activity').value = profile.activity || '1';
  updateBudgetPreview();
}

function updateBudgetPreview() {
  const w   = parseFloat(document.getElementById('p-weight').value) || 70;
  const age = parseInt(document.getElementById('p-age').value)      || 30;
  const sex = document.getElementById('p-sex').value;
  const act = document.getElementById('p-activity').value;
  document.getElementById('profile-budget-val').textContent = calcBudget(w, age, sex, act);
}
['p-weight', 'p-age', 'p-sex', 'p-activity'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', updateBudgetPreview);
});

window.saveProfile = async () => {
  const w = parseFloat(document.getElementById('p-weight').value) || 0;
  const age = parseInt(document.getElementById('p-age').value)    || 30;
  const sex = document.getElementById('p-sex').value;
  const act = document.getElementById('p-activity').value;
  profile = {
    weight:   w,
    goal:     parseFloat(document.getElementById('p-goal').value) || 0,
    age, sex, activity: act,
    budget:   calcBudget(w, age, sex, act),
  };
  await saveProfileDb();
  toast('✅ Profil sauvegardé !');
  updateHeader();
};

// ════════════════════════════════════════
//  NAVIGATION
// ════════════════════════════════════════
window.showPage = (page) => {
  document.querySelectorAll('.page').forEach(p    => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-'  + page)?.classList.add('active');
  document.getElementById('nav-'   + page)?.classList.add('active');
  if (page === 'journal') renderJournal();
  if (page === 'biblio')  renderLibrary();
};
