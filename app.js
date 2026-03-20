// PointFit — app.js

// ── Raccourci getElementById ──────────────────
function el(id) { return document.getElementById(id); }

// ── Getters Firebase (toujours frais depuis window) ──
function fbAuth() { return window.FB_AUTH; }
function fbDb()   { return window.FB_DB;   }

// ══ STATE ════════════════════════════════════
var currentUser   = null;
var isDemoMode    = false;
var profile       = { budget:23, weight:0, goal:0, age:30, sex:‘f’, activity:‘1’ };
var library       = [];
var journal       = {};
var weights       = [];
var currentMeal   = ‘petit-dejeuner’;
var journalOffset = 0;
var unsubProfile  = null;
var unsubLibrary  = null;
var unsubWeights  = null;
var modalCalcData = {};

// ══ UTILS ════════════════════════════════════
function todayStr(offset) {
var d = new Date();
d.setDate(d.getDate() + (offset || 0));
return d.toISOString().split(‘T’)[0];
}
function formatDate(s) {
var p = s.split(’-’);
return p[2]+’/’+p[1]+’/’+p[0];
}
function toast(msg) {
var t = el(‘toast’);
t.textContent = msg;
t.classList.add(‘show’);
setTimeout(function(){ t.classList.remove(‘show’); }, 2400);
}
function calcPts(cal, prot, sat, sugar, fiber) {
cal=+cal||0; prot=+prot||0; sat=+sat||0; sugar=+sugar||0; fiber=+fiber||0;
return Math.max(0, Math.round((cal*0.0305)+(sat*0.275)+(sugar*0.12)-(prot*0.098)-(fiber*0.07)));
}
function calcBudget(weight, age, sex, activity) {
var base = sex===‘m’ ? 26 : 23;
if(weight>90) base+=4; else if(weight>75) base+=2; else if(weight>60) base+=1;
if(age<25) base+=2; else if(age>55) base-=1;
base += (parseInt(activity)||1) - 1;
return Math.max(18, Math.min(45, base));
}
function hideSplash() {
var s = el(‘splash’);
if (s) { s.style.display=‘none’; s.classList.add(‘hide’); }
}
function showAuthScreen() {
hideSplash();
el(‘auth-screen’).classList.remove(‘hidden’);
}
function showAppScreen() {
hideSplash();
el(‘auth-screen’).classList.add(‘hidden’);
el(‘app’).classList.add(‘visible’);
}

// ══ DÉMO ═════════════════════════════════════
function launchDemo() {
isDemoMode  = true;
currentUser = { uid:‘demo’, displayName:‘Utilisateur Démo’, email:‘demo@pointfit.app’ };
profile     = { budget:26, weight:78, goal:70, age:32, sex:‘m’, activity:‘2’ };
var t = todayStr(0), y = todayStr(-1);
journal = {};
journal[t] = { meals: {
‘petit-dejeuner’: [
{ name:“Flocons d’avoine”, cal:150, prot:5,   sat:0.5, sugar:2,  fiber:3,   qty:60,  pts:calcPts(90,3,0.3,1.2,1.8) },
{ name:“Banane”,           cal:89,  prot:1.1, sat:0.1, sugar:12, fiber:2.6, qty:100, pts:0 }
],
‘dejeuner’: [
{ name:“Blanc de poulet”, cal:165, prot:31,  sat:1,   sugar:0, fiber:0,   qty:150, pts:calcPts(248,46.5,1.5,0,0) },
{ name:“Riz blanc cuit”,  cal:130, prot:2.7, sat:0.1, sugar:0, fiber:0.4, qty:150, pts:calcPts(195,4,0.15,0,0.6) },
{ name:“Salade verte”,    cal:15,  prot:1.3, sat:0,   sugar:1, fiber:1.5, qty:80,  pts:0 }
],
‘collation’: [
{ name:“Yaourt nature 0%”, cal:56, prot:8, sat:0.1, sugar:6, fiber:0, qty:125, pts:calcPts(70,10,0.1,7.5,0) }
],
‘diner’: []
}};
journal[y] = { meals: {
‘petit-dejeuner’: [{ name:“Pain complet”, cal:70, prot:3, sat:0.3, sugar:1.5, fiber:2, qty:40, pts:calcPts(28,1.2,0.12,0.6,0.8) }],
‘dejeuner’: [
{ name:“Saumon grillé”,   cal:208, prot:20,  sat:3, sugar:0,   fiber:0,   qty:120, pts:calcPts(250,24,3.6,0,0) },
{ name:“Brocolis vapeur”, cal:35,  prot:2.8, sat:0, sugar:1.7, fiber:2.6, qty:100, pts:0 }
],
‘diner’: [{ name:“Omelette 2 œufs”, cal:148, prot:12, sat:2.8, sugar:0.4, fiber:0, qty:110, pts:calcPts(163,13.2,3.1,0.44,0) }],
‘collation’: []
}};
library = [];
if (typeof FOODS_DB !== ‘undefined’) {
library = FOODS_DB.slice(0,12).map(function(f,i){
return { id:‘demo_’+i, name:f.name, emoji:f.emoji, cal:f.cal, prot:f.prot,
sat:f.sat, sugar:f.sugar, fiber:f.fiber, portion:f.portion,
pts:calcPts(f.cal,f.prot,f.sat,f.sugar,f.fiber) };
});
}
weights = [];
var base = new Date(); base.setDate(base.getDate()-30);
[80.2,79.8,79.5,79.6,79.1,78.9,78.7,79.0,78.5,78.3,78.0,78.2,
77.8,77.6,77.9,77.4,77.2,77.5,77.0,76.8,77.1,76.6,76.4,76.7,
76.2,76.0,76.3,75.9,75.7,78.0].forEach(function(v,i){
var d = new Date(base); d.setDate(d.getDate()+i);
weights.push({ id:‘w’+i, date:d.toISOString().split(‘T’)[0], value:v, ts:d.getTime() });
});
el(‘demo-banner-app’).style.display = ‘block’;
showAppScreen();
setupHeader();
loadProfileUI();
renderJournal();
renderLibrary();
renderWeights();
updateHeader();
toast(‘🎮 Bienvenue en mode démo !’);
}
window.launchDemo = launchDemo;

// ══ AUTH — GOOGLE UNIQUEMENT ══════════════════
function signInWithGoogle() {
var auth = window.FB_AUTH;
if (!auth) {
showError(‘Service non disponible, réessaie dans quelques secondes.’);
return;
}
var provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({ prompt: ‘select_account’ });
auth.signInWithPopup(provider).catch(function(e) {
if (e.code === ‘auth/popup-closed-by-user’) return; // ignoré
if (e.code === ‘auth/popup-blocked’) {
// Fallback redirect si popup bloquée (Safari iOS)
auth.signInWithRedirect(provider);
return;
}
showError(’Erreur : ’ + (e.message || e.code));
});
}
window.signInWithGoogle = signInWithGoogle;

function showError(msg) {
var errEl = el(‘auth-error’);
if (!errEl) return;
errEl.textContent = msg;
errEl.classList.add(‘show’);
}

window.signOut = function() {
if (isDemoMode) {
isDemoMode=false; currentUser=null; journal={}; library=[]; weights=[]; journalOffset=0;
el(‘demo-banner-app’).style.display = ‘none’;
el(‘app’).classList.remove(‘visible’);
showAuthScreen();
return;
}
if (unsubProfile) { unsubProfile(); unsubProfile=null; }
if (unsubLibrary) { unsubLibrary(); unsubLibrary=null; }
if (unsubWeights) { unsubWeights(); unsubWeights=null; }
var auth = window.FB_AUTH;
if (auth) auth.signOut();
};

// ══ FIRESTORE ═════════════════════════════════
function subscribeData() {
var uid = currentUser.uid;
var db  = window.FB_DB;
if (!db) return;
unsubProfile = db.doc(‘users/’+uid+’/data/profile’).onSnapshot(function(snap) {
if (snap.exists) {
profile = Object.assign({}, profile, snap.data());
loadProfileUI();
updateHeader();
}
});
unsubLibrary = db.collection(‘users/’+uid+’/library’).onSnapshot(function(snap) {
library = snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
renderLibrary();
});
loadJournalDay(todayStr(0));
unsubWeights = db.collection(‘users/’+uid+’/weights’).orderBy(‘date’,‘asc’).onSnapshot(function(snap) {
weights = snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
renderWeights();
});
}
function loadJournalDay(dateStr) {
if (journal[dateStr] !== undefined) { renderJournal(); updateHeader(); return; }
var db = window.FB_DB;
if (isDemoMode || !db) { journal[dateStr]={meals:{}}; renderJournal(); updateHeader(); return; }
db.doc(‘users/’+currentUser.uid+’/journal/’+dateStr).get().then(function(snap) {
journal[dateStr] = snap.exists ? snap.data() : {meals:{}};
renderJournal();
updateHeader();
});
}
function saveJournalDay(dateStr) {
var db = window.FB_DB;
if (isDemoMode || !db) return;
db.doc(‘users/’+currentUser.uid+’/journal/’+dateStr).set(journal[dateStr]);
}
function saveProfileDb() {
var db = window.FB_DB;
if (isDemoMode || !db) return;
db.doc(‘users/’+currentUser.uid+’/data/profile’).set(profile);
}

// ══ HEADER ════════════════════════════════════
var DAYS   = [‘Dimanche’,‘Lundi’,‘Mardi’,‘Mercredi’,‘Jeudi’,‘Vendredi’,‘Samedi’];
var MONTHS = [‘janv.’,‘févr.’,‘mars’,‘avr.’,‘mai’,‘juin’,‘juil.’,‘août’,‘sept.’,‘oct.’,‘nov.’,‘déc.’];

function setupHeader() {
var now = new Date();
el(‘header-date’).textContent = DAYS[now.getDay()]+’ ‘+now.getDate()+’ ’+MONTHS[now.getMonth()];
el(‘profile-display-name’).textContent  = currentUser.displayName || ‘Mon profil’;
el(‘profile-display-email’).textContent = currentUser.email || ‘’;
if (currentUser.displayName) el(‘profile-avatar’).textContent = currentUser.displayName[0].toUpperCase();
}

function updateHeader() {
var dateStr = todayStr(0);
var dayData = journal[dateStr];
var used = 0;
if (dayData && dayData.meals) {
Object.keys(dayData.meals).forEach(function(m) {
(dayData.meals[m]||[]).forEach(function(i){ used += i.pts||0; });
});
}
var budget = profile.budget||23, remaining = budget-used;
el(‘ring-remaining’).textContent = remaining;
el(‘stat-used’).textContent      = used;
el(‘stat-budget’).textContent    = budget;
var fill = el(‘ring-fill’);
fill.style.strokeDashoffset = 339.3*(1-Math.min(1,used/budget));
fill.style.stroke = remaining<3 ? ‘#FF3B30’ : ‘var(–yellow)’;
var wUsed = getWeeklyExcess();
el(‘stat-weekly’).textContent       = Math.max(0,35-wUsed);
el(‘weekly-used-label’).textContent = wUsed+’ / 35’;
el(‘weekly-bar-fill’).style.width   = Math.min(100,(wUsed/35)*100)+’%’;
}

function getWeeklyExcess() {
var now = new Date(), day = now.getDay()===0 ? 6 : now.getDay()-1;
var total = 0;
for (var i=0; i<=day; i++) {
var d = new Date(now); d.setDate(d.getDate()-i);
var dd = journal[d.toISOString().split(‘T’)[0]];
if (dd && dd.meals) Object.keys(dd.meals).forEach(function(m){
(dd.meals[m]||[]).forEach(function(item){ total+=item.pts||0; });
});
}
return Math.max(0, total-(profile.budget||23)*(day+1));
}

// ══ JOURNAL ═══════════════════════════════════
var MEAL_LABELS = {
‘petit-dejeuner’:‘🌅 Petit-déjeuner’,
‘dejeuner’:‘🌞 Déjeuner’,
‘diner’:‘🌙 Dîner’,
‘collation’:‘🍎 Collation’
};
var MEAL_ORDER = [‘petit-dejeuner’,‘dejeuner’,‘collation’,‘diner’];

window.changeDay = function(dir) {
journalOffset = Math.min(0, journalOffset+dir);
var dateStr = todayStr(journalOffset);
loadJournalDay(dateStr);
el(‘journal-day-label’).textContent =
journalOffset===0 ? “Aujourd’hui” : journalOffset===-1 ? “Hier” : formatDate(dateStr);
};

function renderJournal() {
var dateStr = todayStr(journalOffset);
var dayData = journal[dateStr] || {meals:{}};
var cont = el(‘journal-content’);
var html=’’, total=0;
MEAL_ORDER.forEach(function(meal) {
var items = (dayData.meals && dayData.meals[meal]) ? dayData.meals[meal] : [];
var mPts  = items.reduce(function(s,i){ return s+(i.pts||0); }, 0);
total += mPts;
html += ‘<div class="meal-section">’
+’<div class="meal-header">’
+’<span class="meal-name">’+MEAL_LABELS[meal]+’</span>’
+’<span class="meal-pts">’+mPts+’ pts</span>’
+’</div>’;
if (!items.length) {
html += ‘<div style="color:var(--text2);font-size:.8rem;padding:3px 0 8px;font-style:italic">Rien ajouté</div>’;
}
items.forEach(function(item, idx) {
html += ‘<div class="food-item">’
+’<div class="food-item-info">’
+’<div class="food-item-name">’+item.name+’</div>’
+’<div class="food-item-detail">’+(item.qty||100)+‘g · ‘+(item.cal||0)+’ kcal · P:’+(item.prot||0)+‘g</div>’
+’</div>’
+’<span class="food-item-pts'+(item.pts===0?' zero':'')+'">’+( item.pts===0?‘🟢 0’:item.pts)+’ pts</span>’
+’<button class="food-item-del" onclick="deleteJournalItem(\''+meal+'\','+idx+')">🗑</button>’
+’</div>’;
});
html += ‘</div>’;
});
cont.innerHTML = total===0
? ‘<div class="empty-journal"><span class="empty-icon">📓</span>Commence à ajouter<br>tes repas !</div>’
: html;
if (journalOffset===0) updateHeader();
}

window.deleteJournalItem = function(meal, idx) {
var dateStr = todayStr(journalOffset);
if (!journal[dateStr] || !journal[dateStr].meals[meal]) return;
journal[dateStr].meals[meal].splice(idx,1);
renderJournal();
saveJournalDay(dateStr);
updateHeader();
toast(‘Aliment supprimé’);
};

// ══ CALCULATEUR ═══════════════════════════════
window.calcPoints = function() {
var cal     = parseFloat(el(‘c-cal’).value)||0;
var prot    = parseFloat(el(‘c-prot’).value)||0;
var sat     = parseFloat(el(‘c-sat’).value)||0;
var sugar   = parseFloat(el(‘c-sugar’).value)||0;
var fiber   = parseFloat(el(‘c-fiber’).value)||0;
var portion = parseFloat(el(‘c-portion’).value)||100;
var f = portion/100;
var pts = calcPts(cal*f, prot*f, sat*f, sugar*f, fiber*f);
el(‘calc-pts’).textContent       = pts;
el(‘calc-pts-label’).textContent = pts===1 ? ‘point’ : ‘points’;
el(‘calc-zero-badge’).innerHTML  = pts===0 ? ‘<span class="zero-badge">🟢 ZeroPoint</span>’ : ‘’;
};

window.searchFoodsDB = function() {
var q = (el(‘foods-db-search’).value||’’).toLowerCase().trim();
var results = el(‘foods-db-results’);
if (!q || q.length<2 || typeof FOODS_DB===‘undefined’) { results.innerHTML=’’; return; }
var matches = FOODS_DB.filter(function(f){
return f.name.toLowerCase().indexOf(q)!==-1 || f.cat.toLowerCase().indexOf(q)!==-1;
}).slice(0,10);
if (!matches.length) {
results.innerHTML = ‘<div style="color:var(--text2);font-size:.85rem;padding:8px">Aucun résultat pour “’+q+’”</div>’;
return;
}
results.innerHTML = matches.map(function(f) {
var idx = FOODS_DB.indexOf(f);
var pts = calcPts(f.cal,f.prot,f.sat,f.sugar,f.fiber);
return ‘<div class="food-db-item" onclick="loadFoodFromDB('+idx+')">’
+’<div class="food-db-emoji">’+f.emoji+’</div>’
+’<div class="food-db-info"><div class="food-db-name">’+f.name+’</div>’
+’<div class="food-db-meta">’+f.cal+’ kcal · P:’+f.prot+‘g · ‘+f.portion+‘g</div></div>’
+’<div class="food-db-pts'+(pts===0?' zero':'')+'">’+( pts===0?‘🟢 0’:pts)+’ pts</div>’
+’</div>’;
}).join(’’);
};

window.loadFoodFromDB = function(idx) {
var f = FOODS_DB[idx]; if(!f) return;
el(‘c-name’).value=f.name; el(‘c-cal’).value=f.cal; el(‘c-prot’).value=f.prot;
el(‘c-sat’).value=f.sat;   el(‘c-sugar’).value=f.sugar; el(‘c-fiber’).value=f.fiber;
el(‘c-portion’).value=f.portion;
el(‘foods-db-search’).value=’’;
el(‘foods-db-results’).innerHTML=’’;
window.calcPoints();
toast(‘📋 ‘+f.name+’ chargé’);
};

window.openAddModal = function() {
var cal=parseFloat(el(‘c-cal’).value)||0, name=el(‘c-name’).value;
if (!cal && !name) { toast(‘Remplis au moins les calories’); return; }
modalCalcData = {
name: name||‘Aliment’,
cal:     parseFloat(el(‘c-cal’).value)||0,
prot:    parseFloat(el(‘c-prot’).value)||0,
sat:     parseFloat(el(‘c-sat’).value)||0,
sugar:   parseFloat(el(‘c-sugar’).value)||0,
fiber:   parseFloat(el(‘c-fiber’).value)||0,
basePortion: parseFloat(el(‘c-portion’).value)||100
};
el(‘modal-qty’).value = modalCalcData.basePortion;
window.updateModalPts();
el(‘add-modal’).classList.remove(‘hidden’);
};
window.closeModal    = function() { el(‘add-modal’).classList.add(‘hidden’); };
window.updateModalPts = function() {
var qty=parseFloat(el(‘modal-qty’).value)||100, f=qty/100;
var pts=calcPts(modalCalcData.cal*f, modalCalcData.prot*f, modalCalcData.sat*f, modalCalcData.sugar*f, modalCalcData.fiber*f);
el(‘modal-pts-display’).textContent = pts+’ pts’;
};
window.selectMeal = function(meal, btn) {
currentMeal = meal;
document.querySelectorAll(’.meal-chip’).forEach(function(c){ c.classList.remove(‘selected’); });
btn.classList.add(‘selected’);
};
window.confirmAddToJournal = function() {
var qty=parseFloat(el(‘modal-qty’).value)||100, f=qty/100;
var pts=calcPts(modalCalcData.cal*f, modalCalcData.prot*f, modalCalcData.sat*f, modalCalcData.sugar*f, modalCalcData.fiber*f);
var dateStr=todayStr(journalOffset);
if (!journal[dateStr]) journal[dateStr]={meals:{}};
if (!journal[dateStr].meals[currentMeal]) journal[dateStr].meals[currentMeal]=[];
journal[dateStr].meals[currentMeal].push({
name:  modalCalcData.name,
cal:   Math.round(modalCalcData.cal*f),
prot:  Math.round(modalCalcData.prot*f*10)/10,
sat:   Math.round(modalCalcData.sat*f*10)/10,
sugar: Math.round(modalCalcData.sugar*f*10)/10,
fiber: Math.round(modalCalcData.fiber*f*10)/10,
qty:   Math.round(qty),
pts:   pts
});
window.closeModal();
renderJournal();
updateHeader();
saveJournalDay(dateStr);
toast(‘✅ Ajouté ! (’+pts+’ pt’+(pts>1?‘s’:’’)+’)’);
window.showPage(‘journal’);
};

// ══ ONGLETS & BASE ALIMENTS ═══════════════════
var currentTab = ‘db’;
var currentCat = ‘Tous’;

window.switchTab = function(tab) {
currentTab = tab;
el(‘tab-db’).classList.toggle(‘active’,  tab===‘db’);
el(‘tab-lib’).classList.toggle(‘active’, tab===‘lib’);
el(‘panel-db’).style.display  = tab===‘db’  ? ‘’ : ‘none’;
el(‘panel-lib’).style.display = tab===‘lib’ ? ‘’ : ‘none’;
if (tab===‘db’)  renderFoodsDB();
if (tab===‘lib’) renderLibrary();
};

function initCatFilters() {
var container = el(‘cat-filters’);
if (!container || typeof FOODS_DB === ‘undefined’) return;
var cats = [‘Tous’];
FOODS_DB.forEach(function(f){ if (cats.indexOf(f.cat)===-1) cats.push(f.cat); });
container.innerHTML = cats.map(function(c){
return ‘<button class="cat-chip'+(c===currentCat?' active':'')+'" onclick="filterCat(\''+c+'\')">’
+ (c===‘Tous’ ? ‘🍽️ Tous’ : c)
+’</button>’;
}).join(’’);
}

window.filterCat = function(cat) {
currentCat = cat;
document.querySelectorAll(’.cat-chip’).forEach(function(b){
b.classList.toggle(‘active’, b.textContent.indexOf(cat)!==-1 || (cat===‘Tous’ && b.textContent.indexOf(‘Tous’)!==-1));
});
renderFoodsDB();
};

function renderFoodsDB() {
if (typeof FOODS_DB === ‘undefined’) return;
var q = (el(‘db-search’) ? el(‘db-search’).value : ‘’).toLowerCase().trim();
var filtered = FOODS_DB.filter(function(f){
var matchCat  = currentCat===‘Tous’ || f.cat===currentCat;
var matchName = !q || f.name.toLowerCase().indexOf(q)!==-1 || f.cat.toLowerCase().indexOf(q)!==-1;
return matchCat && matchName;
});
var list = el(‘db-list’);
if (!filtered.length) {
list.innerHTML = ‘<div style="text-align:center;color:var(--text2);padding:20px;font-size:.88rem">Aucun résultat</div>’;
return;
}
// Affiche max 60 résultats pour la perf
var shown = filtered.slice(0, 60);
list.innerHTML = shown.map(function(f) {
var idx = FOODS_DB.indexOf(f);
var pts = calcPts(f.cal, f.prot, f.sat, f.sugar, f.fiber);
var isInLib = library.some(function(l){ return l.name===f.name; });
return ‘<div class="db-item" onclick="loadFoodFromDB('+idx+')">’
+’<div class="db-item-emoji">’+f.emoji+’</div>’
+’<div class="db-item-info">’
+’<div class="db-item-name">’+f.name+’</div>’
+’<div class="db-item-meta">’+f.cal+’ kcal · P:’+f.prot+‘g · Sat:’+f.sat+‘g · ‘+f.portion+‘g</div>’
+’</div>’
+’<div class="db-item-right">’
+’<span class="db-item-pts'+(pts===0?' zero':'')+'">’+( pts===0?‘🟢 0’:pts)+’ pts</span>’
+’<button class="db-item-fav" onclick="event.stopPropagation();toggleFav('+idx+')" title="'+(isInLib?'Retirer des favoris':'Ajouter aux favoris')+'">’+(isInLib?‘⭐’:‘☆’)+’</button>’
+’</div>’
+’</div>’;
}).join(’’);
if (filtered.length > 60) {
list.innerHTML += ‘<div style="text-align:center;color:var(--text2);font-size:.8rem;padding:10px">…et ‘+(filtered.length-60)+’ autres — affine ta recherche</div>’;
}
}

window.toggleFav = function(idx) {
var f = FOODS_DB[idx]; if (!f) return;
var existing = library.filter(function(l){ return l.name===f.name; })[0];
if (existing) {
// Retirer des favoris
window.deleteLibItem(existing.id);
toast(‘Retiré des favoris’);
} else {
// Ajouter aux favoris
var item = { name:f.name, emoji:f.emoji, cal:f.cal, prot:f.prot,
sat:f.sat, sugar:f.sugar, fiber:f.fiber, portion:f.portion,
pts:calcPts(f.cal,f.prot,f.sat,f.sugar,f.fiber), savedAt:Date.now() };
var db = window.FB_DB;
if (isDemoMode || !db) {
item.id=‘fav_’+Date.now(); library.push(item); renderFoodsDB(); toast(‘⭐ Ajouté aux favoris’);
} else {
db.collection(‘users/’+currentUser.uid+’/library’).add(item).then(function(){
toast(‘⭐ Ajouté aux favoris’);
});
}
}
};
function getEmoji(name) {
var MAP = {pain:‘🍞’,riz:‘🍚’,pates:‘🍝’,poulet:‘🍗’,poisson:‘🐟’,saumon:‘🐟’,
thon:‘🐟’,salade:‘🥗’,pomme:‘🍎’,banane:‘🍌’,yaourt:‘🥛’,fromage:‘🧀’,
oeuf:‘🥚’,chocolat:‘🍫’,eau:‘💧’,lait:‘🥛’,tomate:‘🍅’,carotte:‘🥕’,
brocoli:‘🥦’,dinde:‘🍗’,boeuf:‘🥩’,veau:‘🥩’,agneau:‘🥩’,porc:‘🥩’,
jambon:‘🥩’,crevette:‘🦐’,avoine:‘🌾’};
var lower = name.toLowerCase();
var keys = Object.keys(MAP);
for (var k=0; k<keys.length; k++) { if (lower.indexOf(keys[k])!==-1) return MAP[keys[k]]; }
return ‘🍽️’;
}

window.saveToLibrary = function() {
var name = el(‘c-name’).value.trim();
if (!name) { toast(“Donne un nom à l’aliment”); return; }
var item = {
name: name, emoji: getEmoji(name),
cal:     parseFloat(el(‘c-cal’).value)||0,
prot:    parseFloat(el(‘c-prot’).value)||0,
sat:     parseFloat(el(‘c-sat’).value)||0,
sugar:   parseFloat(el(‘c-sugar’).value)||0,
fiber:   parseFloat(el(‘c-fiber’).value)||0,
portion: parseFloat(el(‘c-portion’).value)||100,
savedAt: Date.now()
};
item.pts = calcPts(item.cal,item.prot,item.sat,item.sugar,item.fiber);
var db = window.FB_DB;
if (isDemoMode || !db) {
item.id=‘demo_’+Date.now(); library.push(item); renderLibrary(); toast(‘💾 Sauvegardé !’); return;
}
db.collection(‘users/’+currentUser.uid+’/library’).add(item).then(function(){ toast(‘💾 Sauvegardé !’); });
};

function renderLibrary() {
var search   = (el(‘lib-search’) ? el(‘lib-search’).value : ‘’).toLowerCase();
var filtered = library.filter(function(i){ return i.name.toLowerCase().indexOf(search)!==-1; });
var list=el(‘library-list’), empty=el(‘library-empty’);
if (!filtered.length) {
list.innerHTML=’’;
empty.style.display=‘block’;
empty.innerHTML = search
? ‘<div style="font-size:2rem">🔍</div><div style="font-size:.88rem;margin-top:8px">Aucun résultat pour “’+search+’”</div>’
: ‘<div style="font-size:2rem">📭</div>’
+’<div style="font-size:.88rem;margin-top:8px;margin-bottom:16px">Ta bibliothèque est vide.<br>Ajoute des aliments depuis le calculateur,<br>ou importe des favoris :</div>’
+’<button class="btn-primary" style="max-width:260px;margin:0 auto" onclick="importFavorites()">⭐ Importer 30 aliments courants</button>’;
return;
}
empty.style.display=‘none’;
list.innerHTML = filtered.map(function(item) {
return ‘<div class="lib-item" onclick="loadFromLibrary(\''+item.id+'\')"><div class="lib-item-emoji">’+(item.emoji||‘🍽️’)+’</div>’
+’<div class="lib-item-info"><div class="lib-item-name">’+item.name+’</div>’
+’<div style="font-size:.7rem;color:var(--text2)">’+(item.cal||0)+’ kcal · P:’+(item.prot||0)+‘g · ‘+(item.portion||100)+‘g</div></div>’
+’<div class="lib-item-pts">’+item.pts+’ pts</div>’
+’<button class="lib-item-del" onclick="event.stopPropagation();deleteLibItem(\''+item.id+'\')">🗑</button></div>’;
}).join(’’);
}

window.loadFromLibrary = function(id) {
var item = library.filter(function(i){ return i.id===id; })[0]; if (!item) return;
el(‘c-name’).value=item.name; el(‘c-cal’).value=item.cal||0; el(‘c-prot’).value=item.prot||0;
el(‘c-sat’).value=item.sat||0; el(‘c-sugar’).value=item.sugar||0;
el(‘c-fiber’).value=item.fiber||0; el(‘c-portion’).value=item.portion||100;
window.calcPoints(); window.showPage(‘calc’); toast(‘📋 ‘+item.name+’ chargé’);
};

window.deleteLibItem = function(id) {
var db = window.FB_DB;
if (isDemoMode || !db) { library=library.filter(function(i){ return i.id!==id; }); renderLibrary(); toast(‘Supprimé’); return; }
db.doc(‘users/’+currentUser.uid+’/library/’+id).delete().then(function(){ toast(‘Supprimé’); });
};

window.importFavorites = function() {
if (typeof FOODS_DB === ‘undefined’ || !FOODS_DB.length) {
toast(‘Erreur : foods.js non chargé’);
return;
}
var favNames = [
‘Blanc de poulet (cuit, sans peau)’,‘Saumon atlantique (filet, cuit)’,
‘Thon (en boîte, au naturel)’,‘Œuf entier (cuit, dur)’,
‘Yaourt nature 0% (Danone/Activia)’,‘Fromage blanc nature 0%’,
‘Skyr nature (Arla, Siggi's\u2026)’,‘Lait demi-écrémé (1,5%)’,
‘Riz blanc (cuit à l'eau)’,‘Pâtes blanches (cuites)’,
‘Flocons d'avoine (secs)’,‘Pomme de terre (bouillie, sans sel)’,
‘Lentilles vertes (cuites)’,‘Pain complet (farine T150)’,
‘Quinoa (cuit)’,‘Brocolis (cuits vapeur)’,
‘Carottes (crues)’,‘Épinards (cuits)’,
‘Tomate (fraîche)’,‘Courgette (cuite)’,
‘Avocat (Hass)’,‘Pomme (Golden, Gala, Fuji\u2026)’,
‘Banane’,‘Orange (navel, sanguine)’,
‘Fraises’,‘Amandes (naturelles)’,
‘Huile d'olive (vierge extra)’,‘Beurre (doux)’,
‘Escalope de dinde (cuite)’,‘Bœuf haché 5% MG (cuit)’
];
var toAdd = FOODS_DB.filter(function(f){ return favNames.indexOf(f.name) !== -1; });
// Évite les doublons avec la bibliothèque existante
toAdd = toAdd.filter(function(f){
return !library.some(function(l){ return l.name === f.name; });
});
if (!toAdd.length) { toast(‘Ces aliments sont déjà dans ta bibliothèque !’); return; }
var db = window.FB_DB;
var count = 0;
toAdd.forEach(function(f) {
var item = { name:f.name, emoji:f.emoji, cal:f.cal, prot:f.prot,
sat:f.sat, sugar:f.sugar, fiber:f.fiber, portion:f.portion,
pts:calcPts(f.cal,f.prot,f.sat,f.sugar,f.fiber), savedAt:Date.now() };
if (isDemoMode || !db) {
item.id = ‘fav_’+(count++); library.push(item);
} else {
db.collection(‘users/’+currentUser.uid+’/library’).add(item);
count++;
}
});
if (isDemoMode || !db) renderLibrary();
toast(‘⭐ ‘+count+’ aliments importés !’);
};

// ══ POIDS ════════════════════════════════════
window.addWeight = function() {
var val = parseFloat(el(‘weight-input’).value);
if (!val||val<30||val>300) { toast(‘Poids invalide’); return; }
var db = window.FB_DB;
if (isDemoMode || !db) {
weights.push({id:‘dw_’+Date.now(), date:todayStr(0), value:val, ts:Date.now()});
renderWeights(); el(‘weight-input’).value=’’; toast(‘⚖️ ‘+val+’ kg enregistré’); return;
}
db.collection(‘users/’+currentUser.uid+’/weights’).add({date:todayStr(0),value:val,ts:Date.now()}).then(function(){
el(‘weight-input’).value=’’; toast(‘⚖️ ‘+val+’ kg enregistré’);
});
};

function renderWeights() {
var hist=el(‘weight-history’), empty=el(‘weight-empty’), statsCard=el(‘weight-stats-card’);
if (!weights.length) { hist.innerHTML=’’; empty.style.display=‘block’; statsCard.style.display=‘none’; return; }
empty.style.display=‘none’; statsCard.style.display=‘block’;
var sorted=weights.slice().sort(function(a,b){ return b.ts-a.ts; });
var diff=sorted[0].value-weights[0].value;
el(‘ws-start’).textContent   = weights[0].value+’ kg’;
el(‘ws-current’).textContent = sorted[0].value+’ kg’;
var diffEl=el(‘ws-diff’);
diffEl.textContent = (diff>=0?’+’:’’)+diff.toFixed(1)+’ kg’;
diffEl.style.color = diff<=0?‘var(–green)’:’#FF3B30’;
hist.innerHTML = sorted.slice(0,10).map(function(w,idx){
var prev=sorted[idx+1], d=prev?w.value-prev.value:0;
return ‘<div class="weight-entry">’
+’<div><div class="weight-val">’+w.value+’ kg</div><div class="weight-date">’+formatDate(w.date)+’</div></div>’
+(prev?’<div class="weight-diff '+(d<=0?'good':'bad')+'">’+(d>0?’+’:’’)+d.toFixed(1)+’ kg</div>’:’<div></div>’)
+’</div>’;
}).join(’’);
drawWeightChart();
}
function drawWeightChart() {
if (weights.length<2) return;
var sorted=weights.slice().sort(function(a,b){ return a.ts-b.ts; }).slice(-15);
var vals=sorted.map(function(w){ return w.value; });
var mn=Math.min.apply(null,vals)-1, mx=Math.max.apply(null,vals)+1;
var pts=sorted.map(function(w,i){
var x=(i/(sorted.length-1))*300, y=88-((w.value-mn)/(mx-mn))*88;
return x+’,’+y;
});
el(‘weight-svg’).innerHTML =
‘<polyline class="chart-line" points="'+pts.join(' ')+'"/>’
+pts.map(function(p){ var xy=p.split(’,’); return ‘<circle class="chart-dot" cx="'+xy[0]+'" cy="'+xy[1]+'" r="3"/>’; }).join(’’);
}

// ══ PROFIL ════════════════════════════════════
function loadProfileUI() {
el(‘p-weight’).value   = profile.weight   || ‘’;
el(‘p-goal’).value     = profile.goal     || ‘’;
el(‘p-age’).value      = profile.age      || ‘’;
el(‘p-sex’).value      = profile.sex      || ‘f’;
el(‘p-activity’).value = profile.activity || ‘1’;
window.updateBudgetPreview();
}
window.updateBudgetPreview = function() {
var w=parseFloat(el(‘p-weight’).value)||70, age=parseInt(el(‘p-age’).value)||30;
el(‘profile-budget-val’).textContent = calcBudget(w, age, el(‘p-sex’).value, el(‘p-activity’).value);
};
window.saveProfile = function() {
var w=parseFloat(el(‘p-weight’).value)||0, age=parseInt(el(‘p-age’).value)||30;
var sex=el(‘p-sex’).value, act=el(‘p-activity’).value;
profile = { weight:w, goal:parseFloat(el(‘p-goal’).value)||0, age:age, sex:sex, activity:act, budget:calcBudget(w,age,sex,act) };
saveProfileDb(); toast(‘✅ Profil sauvegardé !’); updateHeader();
};

// ══ NAVIGATION ════════════════════════════════
window.showPage = function(page) {
document.querySelectorAll(’.page’).forEach(function(p){ p.classList.remove(‘active’); });
document.querySelectorAll(’.nav-btn’).forEach(function(b){ b.classList.remove(‘active’); });
var pg=el(‘page-’+page), nb=el(‘nav-’+page);
if (pg) pg.classList.add(‘active’);
if (nb) nb.classList.add(‘active’);
if (page===‘journal’) renderJournal();
if (page===‘biblio’) {
initCatFilters();
renderFoodsDB();
renderLibrary();
}
};

// ══ INIT ══════════════════════════════════════
// Appelé par le onAuthStateChanged bindé dans index.html
function onFirebaseUser(user) {
if (isDemoMode) return;
currentUser = user;
showAppScreen();
setupHeader();
subscribeData();
}
window.onFirebaseUser = onFirebaseUser;

// Si Firebase a déjà résolu l’utilisateur avant que app.js soit chargé
if (window._pendingUser) {
onFirebaseUser(window._pendingUser);
window._pendingUser = null;
}
