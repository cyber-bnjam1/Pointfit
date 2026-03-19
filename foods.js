// ============================================================
//  PointFit — Base de données des aliments (foods.js)
//  Valeurs nutritionnelles pour 100g sauf mention contraire
//  Sources : Ciqual (ANSES), étiquetages courants
//  Format : { name, emoji, cat, cal, prot, sat, sugar, fiber, portion }
//    cal   = calories (kcal)
//    prot  = protéines (g)
//    sat   = acides gras saturés (g)
//    sugar = sucres (g)
//    fiber = fibres (g)
//    portion = portion de référence par défaut (g)
// ============================================================

const FOODS_DB = [

  // ──────────────────────────────────────────
  // 🥩 VIANDES
  // ──────────────────────────────────────────
  { name: "Blanc de poulet", emoji: "🍗", cat: "Viandes", cal: 110, prot: 23.0, sat: 0.5, sugar: 0.0, fiber: 0.0, portion: 150 },
  { name: "Escalope de dinde", emoji: "🍗", cat: "Viandes", cal: 104, prot: 21.5, sat: 0.4, sugar: 0.0, fiber: 0.0, portion: 150 },
  { name: "Bœuf haché 5% MG", emoji: "🥩", cat: "Viandes", cal: 121, prot: 20.0, sat: 1.9, sugar: 0.0, fiber: 0.0, portion: 125 },
  { name: "Bœuf haché 15% MG", emoji: "🥩", cat: "Viandes", cal: 197, prot: 17.0, sat: 5.8, sugar: 0.0, fiber: 0.0, portion: 125 },
  { name: "Steak de bœuf (grillé)", emoji: "🥩", cat: "Viandes", cal: 175, prot: 26.0, sat: 3.0, sugar: 0.0, fiber: 0.0, portion: 150 },
  { name: "Filet mignon de porc", emoji: "🥩", cat: "Viandes", cal: 109, prot: 22.0, sat: 1.0, sugar: 0.0, fiber: 0.0, portion: 150 },
  { name: "Côtelette de porc", emoji: "🥩", cat: "Viandes", cal: 215, prot: 19.0, sat: 5.5, sugar: 0.0, fiber: 0.0, portion: 150 },
  { name: "Jambon blanc (cuit)", emoji: "🥩", cat: "Viandes", cal: 107, prot: 17.0, sat: 1.2, sugar: 1.0, fiber: 0.0, portion: 60 },
  { name: "Jambon de pays (cru)", emoji: "🥩", cat: "Viandes", cal: 195, prot: 23.0, sat: 4.5, sugar: 0.5, fiber: 0.0, portion: 40 },
  { name: "Blanc de dinde (charcuterie)", emoji: "🍗", cat: "Viandes", cal: 97, prot: 18.0, sat: 0.8, sugar: 1.5, fiber: 0.0, portion: 60 },
  { name: "Poulet rôti (cuisse)", emoji: "🍗", cat: "Viandes", cal: 185, prot: 19.0, sat: 3.5, sugar: 0.0, fiber: 0.0, portion: 150 },
  { name: "Veau (escalope)", emoji: "🥩", cat: "Viandes", cal: 107, prot: 22.0, sat: 0.7, sugar: 0.0, fiber: 0.0, portion: 150 },
  { name: "Agneau (gigot)", emoji: "🥩", cat: "Viandes", cal: 156, prot: 21.0, sat: 3.5, sugar: 0.0, fiber: 0.0, portion: 150 },
  { name: "Lapin (cuit)", emoji: "🐰", cat: "Viandes", cal: 114, prot: 21.0, sat: 1.0, sugar: 0.0, fiber: 0.0, portion: 150 },
  { name: "Lardons fumés", emoji: "🥓", cat: "Viandes", cal: 344, prot: 14.0, sat: 12.0, sugar: 0.5, fiber: 0.0, portion: 50 },

  // ──────────────────────────────────────────
  // 🐟 POISSONS & FRUITS DE MER
  // ──────────────────────────────────────────
  { name: "Saumon (filet)", emoji: "🐟", cat: "Poissons", cal: 208, prot: 20.0, sat: 3.0, sugar: 0.0, fiber: 0.0, portion: 150 },
  { name: "Thon en boîte (au naturel)", emoji: "🐟", cat: "Poissons", cal: 100, prot: 23.0, sat: 0.4, sugar: 0.0, fiber: 0.0, portion: 100 },
  { name: "Cabillaud (dos de cabillaud)", emoji: "🐟", cat: "Poissons", cal: 82, prot: 18.0, sat: 0.1, sugar: 0.0, fiber: 0.0, portion: 150 },
  { name: "Sardines à l'huile (égouttées)", emoji: "🐟", cat: "Poissons", cal: 185, prot: 20.0, sat: 2.8, sugar: 0.0, fiber: 0.0, portion: 100 },
  { name: "Crevettes cuites", emoji: "🦐", cat: "Poissons", cal: 99, prot: 21.0, sat: 0.2, sugar: 0.0, fiber: 0.0, portion: 100 },
  { name: "Tilapia (filet)", emoji: "🐟", cat: "Poissons", cal: 96, prot: 20.0, sat: 0.5, sugar: 0.0, fiber: 0.0, portion: 150 },
  { name: "Maquereau (filet)", emoji: "🐟", cat: "Poissons", cal: 205, prot: 19.0, sat: 4.0, sugar: 0.0, fiber: 0.0, portion: 130 },
  { name: "Moules (cuites)", emoji: "🦪", cat: "Poissons", cal: 86, prot: 14.0, sat: 0.5, sugar: 1.5, fiber: 0.0, portion: 200 },
  { name: "Lieu noir (filet)", emoji: "🐟", cat: "Poissons", cal: 79, prot: 18.0, sat: 0.1, sugar: 0.0, fiber: 0.0, portion: 150 },
  { name: "Truite (filet)", emoji: "🐟", cat: "Poissons", cal: 119, prot: 20.0, sat: 1.2, sugar: 0.0, fiber: 0.0, portion: 150 },
  { name: "Crabe (en conserve)", emoji: "🦀", cat: "Poissons", cal: 84, prot: 18.0, sat: 0.2, sugar: 0.0, fiber: 0.0, portion: 100 },

  // ──────────────────────────────────────────
  // 🥚 ŒUFS & PRODUITS LAITIERS
  // ──────────────────────────────────────────
  { name: "Œuf entier", emoji: "🥚", cat: "Œufs & Laitiers", cal: 143, prot: 12.6, sat: 3.1, sugar: 0.4, fiber: 0.0, portion: 60 },
  { name: "Blanc d'œuf", emoji: "🥚", cat: "Œufs & Laitiers", cal: 52, prot: 10.9, sat: 0.0, sugar: 0.7, fiber: 0.0, portion: 40 },
  { name: "Yaourt nature 0%", emoji: "🥛", cat: "Œufs & Laitiers", cal: 41, prot: 4.3, sat: 0.1, sugar: 5.1, fiber: 0.0, portion: 125 },
  { name: "Yaourt nature entier", emoji: "🥛", cat: "Œufs & Laitiers", cal: 61, prot: 3.8, sat: 1.8, sugar: 4.7, fiber: 0.0, portion: 125 },
  { name: "Fromage blanc 0%", emoji: "🥛", cat: "Œufs & Laitiers", cal: 42, prot: 7.2, sat: 0.1, sugar: 3.6, fiber: 0.0, portion: 100 },
  { name: "Fromage blanc 20%", emoji: "🥛", cat: "Œufs & Laitiers", cal: 79, prot: 7.0, sat: 2.0, sugar: 3.8, fiber: 0.0, portion: 100 },
  { name: "Skyr nature", emoji: "🥛", cat: "Œufs & Laitiers", cal: 57, prot: 9.9, sat: 0.1, sugar: 4.2, fiber: 0.0, portion: 150 },
  { name: "Lait demi-écrémé", emoji: "🥛", cat: "Œufs & Laitiers", cal: 46, prot: 3.2, sat: 0.9, sugar: 4.7, fiber: 0.0, portion: 250 },
  { name: "Lait écrémé", emoji: "🥛", cat: "Œufs & Laitiers", cal: 34, prot: 3.4, sat: 0.1, sugar: 4.9, fiber: 0.0, portion: 250 },
  { name: "Emmental (râpé)", emoji: "🧀", cat: "Œufs & Laitiers", cal: 382, prot: 28.0, sat: 15.6, sugar: 0.5, fiber: 0.0, portion: 30 },
  { name: "Camembert", emoji: "🧀", cat: "Œufs & Laitiers", cal: 272, prot: 17.0, sat: 13.5, sugar: 0.5, fiber: 0.0, portion: 40 },
  { name: "Feta", emoji: "🧀", cat: "Œufs & Laitiers", cal: 264, prot: 14.0, sat: 12.0, sugar: 0.5, fiber: 0.0, portion: 40 },
  { name: "Mozzarella", emoji: "🧀", cat: "Œufs & Laitiers", cal: 254, prot: 17.5, sat: 10.0, sugar: 1.0, fiber: 0.0, portion: 50 },
  { name: "Cottage cheese", emoji: "🥛", cat: "Œufs & Laitiers", cal: 103, prot: 12.5, sat: 1.4, sugar: 3.4, fiber: 0.0, portion: 100 },
  { name: "Crème fraîche légère 15%", emoji: "🥛", cat: "Œufs & Laitiers", cal: 148, prot: 2.9, sat: 7.0, sugar: 3.5, fiber: 0.0, portion: 30 },

  // ──────────────────────────────────────────
  // 🍞 FÉCULENTS & CÉRÉALES
  // ──────────────────────────────────────────
  { name: "Riz blanc (cuit)", emoji: "🍚", cat: "Féculents", cal: 130, prot: 2.7, sat: 0.1, sugar: 0.1, fiber: 0.4, portion: 150 },
  { name: "Riz complet (cuit)", emoji: "🍚", cat: "Féculents", cal: 123, prot: 2.7, sat: 0.1, sugar: 0.3, fiber: 1.8, portion: 150 },
  { name: "Pâtes (cuites)", emoji: "🍝", cat: "Féculents", cal: 131, prot: 5.0, sat: 0.2, sugar: 0.6, fiber: 1.8, portion: 150 },
  { name: "Pâtes complètes (cuites)", emoji: "🍝", cat: "Féculents", cal: 124, prot: 5.4, sat: 0.2, sugar: 0.5, fiber: 3.5, portion: 150 },
  { name: "Quinoa (cuit)", emoji: "🌾", cat: "Féculents", cal: 120, prot: 4.4, sat: 0.2, sugar: 0.9, fiber: 2.8, portion: 150 },
  { name: "Flocons d'avoine (secs)", emoji: "🌾", cat: "Féculents", cal: 370, prot: 13.0, sat: 1.4, sugar: 1.0, fiber: 10.0, portion: 50 },
  { name: "Pain complet", emoji: "🍞", cat: "Féculents", cal: 247, prot: 9.0, sat: 0.6, sugar: 3.5, fiber: 6.0, portion: 40 },
  { name: "Pain blanc (baguette)", emoji: "🥖", cat: "Féculents", cal: 270, prot: 8.5, sat: 0.5, sugar: 2.5, fiber: 2.7, portion: 40 },
  { name: "Pain de seigle", emoji: "🍞", cat: "Féculents", cal: 233, prot: 6.8, sat: 0.4, sugar: 2.8, fiber: 7.0, portion: 40 },
  { name: "Pomme de terre (cuite vapeur)", emoji: "🥔", cat: "Féculents", cal: 86, prot: 2.0, sat: 0.0, sugar: 0.7, fiber: 1.8, portion: 200 },
  { name: "Patate douce (cuite)", emoji: "🍠", cat: "Féculents", cal: 90, prot: 1.6, sat: 0.0, sugar: 4.2, fiber: 3.3, portion: 200 },
  { name: "Lentilles (cuites)", emoji: "🫘", cat: "Féculents", cal: 116, prot: 9.0, sat: 0.1, sugar: 1.2, fiber: 7.9, portion: 150 },
  { name: "Pois chiches (cuits)", emoji: "🫘", cat: "Féculents", cal: 164, prot: 8.9, sat: 0.3, sugar: 2.6, fiber: 7.6, portion: 150 },
  { name: "Haricots rouges (cuits)", emoji: "🫘", cat: "Féculents", cal: 127, prot: 8.7, sat: 0.1, sugar: 0.3, fiber: 8.7, portion: 150 },
  { name: "Boulgour (cuit)", emoji: "🌾", cat: "Féculents", cal: 83, prot: 3.1, sat: 0.1, sugar: 0.1, fiber: 4.5, portion: 150 },
  { name: "Semoule de blé (cuite)", emoji: "🌾", cat: "Féculents", cal: 112, prot: 3.8, sat: 0.1, sugar: 0.4, fiber: 1.3, portion: 150 },
  { name: "Galette de riz soufflé", emoji: "🌾", cat: "Féculents", cal: 381, prot: 7.0, sat: 0.5, sugar: 1.2, fiber: 2.3, portion: 9 },
  { name: "Muesli sans sucre ajouté", emoji: "🌾", cat: "Féculents", cal: 350, prot: 9.0, sat: 1.5, sugar: 10.0, fiber: 8.0, portion: 50 },
  { name: "Corn flakes", emoji: "🌾", cat: "Féculents", cal: 377, prot: 6.5, sat: 0.4, sugar: 8.0, fiber: 3.0, portion: 40 },

  // ──────────────────────────────────────────
  // 🥦 LÉGUMES
  // ──────────────────────────────────────────
  { name: "Brocolis (cuits)", emoji: "🥦", cat: "Légumes", cal: 28, prot: 2.8, sat: 0.0, sugar: 1.7, fiber: 2.6, portion: 150 },
  { name: "Courgette (cuite)", emoji: "🥒", cat: "Légumes", cal: 18, prot: 1.4, sat: 0.0, sugar: 2.3, fiber: 1.1, portion: 150 },
  { name: "Tomate (fraîche)", emoji: "🍅", cat: "Légumes", cal: 20, prot: 0.9, sat: 0.0, sugar: 2.6, fiber: 1.2, portion: 150 },
  { name: "Salade verte (laitue)", emoji: "🥬", cat: "Légumes", cal: 13, prot: 1.3, sat: 0.0, sugar: 0.6, fiber: 1.3, portion: 80 },
  { name: "Carottes (crues)", emoji: "🥕", cat: "Légumes", cal: 41, prot: 0.9, sat: 0.0, sugar: 5.7, fiber: 3.0, portion: 100 },
  { name: "Épinards (cuits)", emoji: "🥬", cat: "Légumes", cal: 23, prot: 2.9, sat: 0.0, sugar: 0.3, fiber: 2.2, portion: 150 },
  { name: "Haricots verts (cuits)", emoji: "🫘", cat: "Légumes", cal: 35, prot: 2.1, sat: 0.0, sugar: 3.6, fiber: 3.4, portion: 150 },
  { name: "Champignons (cuits)", emoji: "🍄", cat: "Légumes", cal: 28, prot: 2.1, sat: 0.0, sugar: 1.0, fiber: 1.7, portion: 100 },
  { name: "Poivron rouge (cru)", emoji: "🫑", cat: "Légumes", cal: 28, prot: 1.0, sat: 0.0, sugar: 4.7, fiber: 2.1, portion: 100 },
  { name: "Concombre (cru)", emoji: "🥒", cat: "Légumes", cal: 12, prot: 0.7, sat: 0.0, sugar: 1.7, fiber: 0.5, portion: 100 },
  { name: "Aubergine (cuite)", emoji: "🍆", cat: "Légumes", cal: 28, prot: 1.0, sat: 0.0, sugar: 2.4, fiber: 2.7, portion: 150 },
  { name: "Chou-fleur (cuit)", emoji: "🥦", cat: "Légumes", cal: 23, prot: 2.5, sat: 0.0, sugar: 1.4, fiber: 2.1, portion: 150 },
  { name: "Petits pois (cuits)", emoji: "🟢", cat: "Légumes", cal: 81, prot: 5.4, sat: 0.1, sugar: 5.5, fiber: 5.5, portion: 100 },
  { name: "Poireau (cuit)", emoji: "🌿", cat: "Légumes", cal: 27, prot: 1.5, sat: 0.0, sugar: 2.0, fiber: 1.8, portion: 150 },
  { name: "Céleri (cru)", emoji: "🌿", cat: "Légumes", cal: 14, prot: 0.7, sat: 0.0, sugar: 1.4, fiber: 1.8, portion: 100 },
  { name: "Betterave (cuite)", emoji: "🟣", cat: "Légumes", cal: 44, prot: 1.7, sat: 0.0, sugar: 8.0, fiber: 2.0, portion: 100 },
  { name: "Maïs (en conserve)", emoji: "🌽", cat: "Légumes", cal: 94, prot: 3.5, sat: 0.5, sugar: 5.0, fiber: 3.0, portion: 100 },
  { name: "Avocat", emoji: "🥑", cat: "Légumes", cal: 167, prot: 2.0, sat: 2.1, sugar: 0.4, fiber: 6.7, portion: 80 },
  { name: "Radis (crus)", emoji: "🌿", cat: "Légumes", cal: 20, prot: 1.0, sat: 0.0, sugar: 2.0, fiber: 1.6, portion: 100 },
  { name: "Oignon (cru)", emoji: "🧅", cat: "Légumes", cal: 40, prot: 1.1, sat: 0.0, sugar: 5.0, fiber: 1.7, portion: 50 },
  { name: "Ail (cru)", emoji: "🧄", cat: "Légumes", cal: 149, prot: 6.4, sat: 0.1, sugar: 1.0, fiber: 2.1, portion: 5 },

  // ──────────────────────────────────────────
  // 🍎 FRUITS
  // ──────────────────────────────────────────
  { name: "Pomme", emoji: "🍎", cat: "Fruits", cal: 52, prot: 0.3, sat: 0.0, sugar: 10.4, fiber: 2.4, portion: 150 },
  { name: "Banane", emoji: "🍌", cat: "Fruits", cal: 89, prot: 1.1, sat: 0.1, sugar: 12.2, fiber: 2.6, portion: 120 },
  { name: "Orange", emoji: "🍊", cat: "Fruits", cal: 47, prot: 0.9, sat: 0.0, sugar: 8.6, fiber: 2.2, portion: 150 },
  { name: "Fraises", emoji: "🍓", cat: "Fruits", cal: 32, prot: 0.7, sat: 0.0, sugar: 4.9, fiber: 2.0, portion: 150 },
  { name: "Raisins", emoji: "🍇", cat: "Fruits", cal: 69, prot: 0.7, sat: 0.0, sugar: 15.5, fiber: 0.9, portion: 100 },
  { name: "Kiwi", emoji: "🥝", cat: "Fruits", cal: 61, prot: 1.1, sat: 0.0, sugar: 9.0, fiber: 3.0, portion: 100 },
  { name: "Mangue", emoji: "🥭", cat: "Fruits", cal: 60, prot: 0.8, sat: 0.0, sugar: 13.4, fiber: 1.6, portion: 150 },
  { name: "Pêche", emoji: "🍑", cat: "Fruits", cal: 39, prot: 0.9, sat: 0.0, sugar: 8.4, fiber: 1.5, portion: 150 },
  { name: "Poire", emoji: "🍐", cat: "Fruits", cal: 57, prot: 0.4, sat: 0.0, sugar: 9.8, fiber: 3.1, portion: 150 },
  { name: "Pastèque", emoji: "🍉", cat: "Fruits", cal: 30, prot: 0.6, sat: 0.0, sugar: 6.2, fiber: 0.4, portion: 200 },
  { name: "Ananas", emoji: "🍍", cat: "Fruits", cal: 50, prot: 0.5, sat: 0.0, sugar: 10.0, fiber: 1.4, portion: 150 },
  { name: "Myrtilles", emoji: "🫐", cat: "Fruits", cal: 57, prot: 0.7, sat: 0.0, sugar: 10.0, fiber: 2.4, portion: 100 },
  { name: "Framboises", emoji: "🍓", cat: "Fruits", cal: 52, prot: 1.2, sat: 0.0, sugar: 4.4, fiber: 6.5, portion: 100 },
  { name: "Citron (jus)", emoji: "🍋", cat: "Fruits", cal: 22, prot: 0.4, sat: 0.0, sugar: 2.4, fiber: 0.3, portion: 50 },
  { name: "Abricot", emoji: "🍑", cat: "Fruits", cal: 48, prot: 1.4, sat: 0.0, sugar: 9.2, fiber: 2.0, portion: 100 },
  { name: "Cerises", emoji: "🍒", cat: "Fruits", cal: 63, prot: 1.1, sat: 0.0, sugar: 12.8, fiber: 1.6, portion: 100 },
  { name: "Clémentine", emoji: "🍊", cat: "Fruits", cal: 53, prot: 0.9, sat: 0.0, sugar: 9.2, fiber: 1.7, portion: 100 },
  { name: "Melon", emoji: "🍈", cat: "Fruits", cal: 34, prot: 0.8, sat: 0.0, sugar: 7.4, fiber: 0.9, portion: 200 },

  // ──────────────────────────────────────────
  // 🥜 LÉGUMINEUSES, OLÉAGINEUX & GRAINES
  // ──────────────────────────────────────────
  { name: "Amandes", emoji: "🌰", cat: "Oléagineux", cal: 579, prot: 21.0, sat: 3.9, sugar: 3.9, fiber: 12.5, portion: 30 },
  { name: "Noix", emoji: "🌰", cat: "Oléagineux", cal: 654, prot: 15.2, sat: 6.1, sugar: 2.6, fiber: 6.7, portion: 30 },
  { name: "Noix de cajou", emoji: "🌰", cat: "Oléagineux", cal: 553, prot: 18.0, sat: 9.2, sugar: 5.9, fiber: 3.3, portion: 30 },
  { name: "Noisettes", emoji: "🌰", cat: "Oléagineux", cal: 628, prot: 15.0, sat: 4.5, sugar: 4.3, fiber: 9.7, portion: 30 },
  { name: "Cacahuètes (grillées)", emoji: "🥜", cat: "Oléagineux", cal: 599, prot: 25.0, sat: 7.7, sugar: 3.5, fiber: 8.0, portion: 30 },
  { name: "Beurre de cacahuète", emoji: "🥜", cat: "Oléagineux", cal: 588, prot: 25.0, sat: 10.0, sugar: 9.0, fiber: 6.0, portion: 20 },
  { name: "Graines de tournesol", emoji: "🌻", cat: "Oléagineux", cal: 584, prot: 20.8, sat: 4.5, sugar: 2.6, fiber: 8.6, portion: 20 },
  { name: "Graines de chia", emoji: "🌱", cat: "Oléagineux", cal: 486, prot: 16.5, sat: 3.3, sugar: 0.0, fiber: 34.4, portion: 15 },
  { name: "Graines de lin", emoji: "🌱", cat: "Oléagineux", cal: 534, prot: 18.3, sat: 3.7, sugar: 1.6, fiber: 27.3, portion: 10 },
  { name: "Pistaches (grillées)", emoji: "🌰", cat: "Oléagineux", cal: 560, prot: 20.0, sat: 5.4, sugar: 7.7, fiber: 10.6, portion: 30 },

  // ──────────────────────────────────────────
  // 🫙 CONDIMENTS, HUILES & MATIÈRES GRASSES
  // ──────────────────────────────────────────
  { name: "Huile d'olive", emoji: "🫙", cat: "Matières grasses", cal: 884, prot: 0.0, sat: 13.8, sugar: 0.0, fiber: 0.0, portion: 10 },
  { name: "Huile de colza", emoji: "🫙", cat: "Matières grasses", cal: 884, prot: 0.0, sat: 7.4, sugar: 0.0, fiber: 0.0, portion: 10 },
  { name: "Beurre", emoji: "🧈", cat: "Matières grasses", cal: 717, prot: 0.7, sat: 50.5, sugar: 0.6, fiber: 0.0, portion: 10 },
  { name: "Beurre allégé 41%", emoji: "🧈", cat: "Matières grasses", cal: 361, prot: 0.5, sat: 25.0, sugar: 0.8, fiber: 0.0, portion: 10 },
  { name: "Margarine (tartiner)", emoji: "🧈", cat: "Matières grasses", cal: 530, prot: 0.1, sat: 16.0, sugar: 0.0, fiber: 0.0, portion: 10 },
  { name: "Mayonnaise", emoji: "🫙", cat: "Matières grasses", cal: 680, prot: 1.5, sat: 8.0, sugar: 1.5, fiber: 0.0, portion: 15 },
  { name: "Mayonnaise allégée", emoji: "🫙", cat: "Matières grasses", cal: 290, prot: 1.3, sat: 3.0, sugar: 5.0, fiber: 0.0, portion: 15 },
  { name: "Vinaigrette", emoji: "🫙", cat: "Matières grasses", cal: 270, prot: 0.2, sat: 4.0, sugar: 4.0, fiber: 0.0, portion: 15 },
  { name: "Moutarde de Dijon", emoji: "🫙", cat: "Condiments", cal: 60, prot: 4.0, sat: 0.4, sugar: 2.0, fiber: 3.0, portion: 10 },
  { name: "Ketchup", emoji: "🫙", cat: "Condiments", cal: 100, prot: 1.5, sat: 0.1, sugar: 22.0, fiber: 0.5, portion: 15 },
  { name: "Sauce soja (light)", emoji: "🫙", cat: "Condiments", cal: 43, prot: 6.5, sat: 0.0, sugar: 0.6, fiber: 0.0, portion: 15 },
  { name: "Vinaigre de cidre", emoji: "🫙", cat: "Condiments", cal: 21, prot: 0.0, sat: 0.0, sugar: 0.4, fiber: 0.0, portion: 15 },

  // ──────────────────────────────────────────
  // 🧃 BOISSONS
  // ──────────────────────────────────────────
  { name: "Eau (plate ou gazeuse)", emoji: "💧", cat: "Boissons", cal: 0, prot: 0.0, sat: 0.0, sugar: 0.0, fiber: 0.0, portion: 250 },
  { name: "Café noir (sans sucre)", emoji: "☕", cat: "Boissons", cal: 2, prot: 0.3, sat: 0.0, sugar: 0.0, fiber: 0.0, portion: 250 },
  { name: "Thé (sans sucre)", emoji: "🍵", cat: "Boissons", cal: 1, prot: 0.0, sat: 0.0, sugar: 0.0, fiber: 0.0, portion: 250 },
  { name: "Jus d'orange (100%)", emoji: "🍊", cat: "Boissons", cal: 44, prot: 0.7, sat: 0.0, sugar: 8.4, fiber: 0.2, portion: 200 },
  { name: "Lait végétal (amande)", emoji: "🥛", cat: "Boissons", cal: 24, prot: 0.5, sat: 0.1, sugar: 3.0, fiber: 0.5, portion: 250 },
  { name: "Lait végétal (avoine)", emoji: "🥛", cat: "Boissons", cal: 44, prot: 1.2, sat: 0.2, sugar: 4.0, fiber: 0.8, portion: 250 },
  { name: "Boisson protéinée (whey, eau)", emoji: "💪", cat: "Boissons", cal: 110, prot: 22.0, sat: 0.5, sugar: 1.5, fiber: 0.0, portion: 300 },

  // ──────────────────────────────────────────
  // 🍫 SUCRERIES, SNACKS & PLAISIRS
  // ──────────────────────────────────────────
  { name: "Chocolat noir 70%", emoji: "🍫", cat: "Sucreries", cal: 598, prot: 8.0, sat: 19.0, sugar: 24.0, fiber: 11.0, portion: 20 },
  { name: "Chocolat au lait", emoji: "🍫", cat: "Sucreries", cal: 535, prot: 7.5, sat: 19.0, sugar: 56.0, fiber: 3.0, portion: 20 },
  { name: "Biscuit sablé", emoji: "🍪", cat: "Sucreries", cal: 480, prot: 5.5, sat: 10.0, sugar: 22.0, fiber: 1.5, portion: 20 },
  { name: "Chips (nature)", emoji: "🥔", cat: "Sucreries", cal: 536, prot: 6.0, sat: 5.0, sugar: 0.5, fiber: 4.0, portion: 30 },
  { name: "Gâteau yaourt (fait maison)", emoji: "🎂", cat: "Sucreries", cal: 310, prot: 5.5, sat: 5.0, sugar: 30.0, fiber: 0.8, portion: 80 },
  { name: "Miel", emoji: "🍯", cat: "Sucreries", cal: 304, prot: 0.3, sat: 0.0, sugar: 82.0, fiber: 0.0, portion: 10 },
  { name: "Confiture (standard)", emoji: "🍓", cat: "Sucreries", cal: 250, prot: 0.4, sat: 0.0, sugar: 60.0, fiber: 0.5, portion: 20 },
  { name: "Sucre blanc", emoji: "🍬", cat: "Sucreries", cal: 400, prot: 0.0, sat: 0.0, sugar: 100.0, fiber: 0.0, portion: 5 },
  { name: "Compote de pommes (sans sucre)", emoji: "🍎", cat: "Sucreries", cal: 43, prot: 0.2, sat: 0.0, sugar: 9.6, fiber: 1.5, portion: 100 },

  // ──────────────────────────────────────────
  // 🍕 PLATS COURANTS (portion entière)
  // ──────────────────────────────────────────
  { name: "Pizza margherita (part)", emoji: "🍕", cat: "Plats", cal: 266, prot: 11.0, sat: 4.0, sugar: 4.5, fiber: 2.0, portion: 120 },
  { name: "Hamburger maison", emoji: "🍔", cat: "Plats", cal: 295, prot: 18.0, sat: 7.0, sugar: 5.0, fiber: 1.5, portion: 200 },
  { name: "Quiche lorraine (part)", emoji: "🥧", cat: "Plats", cal: 340, prot: 12.0, sat: 12.0, sugar: 3.0, fiber: 0.5, portion: 130 },
  { name: "Soupe de légumes (maison)", emoji: "🍲", cat: "Plats", cal: 48, prot: 2.0, sat: 0.2, sugar: 4.0, fiber: 2.5, portion: 300 },
  { name: "Taboulé (traiteur)", emoji: "🥗", cat: "Plats", cal: 165, prot: 3.5, sat: 1.5, sugar: 4.5, fiber: 2.0, portion: 200 },
  { name: "Couscous (viande + légumes)", emoji: "🍲", cat: "Plats", cal: 150, prot: 10.0, sat: 2.5, sugar: 3.0, fiber: 2.5, portion: 300 },
  { name: "Ratatouille (maison)", emoji: "🍲", cat: "Plats", cal: 55, prot: 1.8, sat: 0.5, sugar: 5.0, fiber: 3.0, portion: 200 },
  { name: "Gratin dauphinois", emoji: "🥔", cat: "Plats", cal: 165, prot: 4.0, sat: 6.0, sugar: 2.0, fiber: 1.5, portion: 200 },
  { name: "Omelette nature (2 œufs)", emoji: "🍳", cat: "Plats", cal: 150, prot: 12.0, sat: 3.5, sugar: 0.5, fiber: 0.0, portion: 110 },
  { name: "Salade niçoise", emoji: "🥗", cat: "Plats", cal: 130, prot: 12.0, sat: 2.0, sugar: 3.0, fiber: 2.5, portion: 300 },
];

// ── Catégories disponibles (pour filtres futurs)
const FOOD_CATEGORIES = [
  "Viandes", "Poissons", "Œufs & Laitiers", "Féculents",
  "Légumes", "Fruits", "Oléagineux", "Matières grasses",
  "Condiments", "Boissons", "Sucreries", "Plats"
];

// ── Export (utilisé par app.js via import ou script global)
if (typeof module !== 'undefined') {
  module.exports = { FOODS_DB, FOOD_CATEGORIES };
}
