// Levensboom volgens Kabbalistische traditie
// Met Da'at als 11e sefira en alle 25 paden met correcte Hebreeuwse letters
// Layout: Binah LINKS, Chokhmah RECHTS
// Verticale proportionering - Tiferet en Yesod lager voorAleph/Mem verbindingen

export const sefirot = [
  { id: 'keter', name: 'Keter', x: 50, y: 10 },      // Kroon - bovenaan (iets omlaag voor tekst-ruimte)
  { id: 'binah', name: 'Binah', x: 20, y: 18 },     // Begrip - LINKS boven
  { id: 'chokhmah', name: 'Chokhmah', x: 80, y: 18 }, // Wijsheid - RECHTS boven
  { id: 'da_at', name: "Da'at", x: 50, y: 24 },     // Kennis - korte afstand van Keter
  { id: 'gevurah', name: 'Gevurah', x: 20, y: 38 },  // Strengheid - LINKS midden
  { id: 'chesed', name: 'Chesed', x: 80, y: 38 },    // Liefde - RECHTS midden
  { id: 'tiferet', name: 'Tiferet', x: 50, y: 50 },   // Schoonheid - centraal
  { id: 'hod', name: 'Hod', x: 20, y: 62 },           // Majesteit - LINKS onder
  { id: 'netzach', name: 'Netzach', x: 80, y: 62 },   // Overwinning - RECHTS onder
  { id: 'yesod', name: 'Yesod', x: 50, y: 66 },       // Fundament - centraal
  { id: 'malkuth', name: 'Malkuth', x: 50, y: 88 },   // Koninkrijk - onderaan
]

// Alle 25 paden met exacte Hebreeuwse letters
export const paths = [
  // === HORIZONTALE PADEN ===
  { from: 'binah', to: 'chokhmah', letter: 'ש' },    // Shin - Binah ⟷ Chokhmah (bovenste balk)
  { from: 'gevurah', to: 'chesed', letter: 'א' },   // Alef - Gevurah ⟷ Chesed (middelste balk)
  { from: 'hod', to: 'netzach', letter: 'מ' },      // Mem - Hod ⟷ Netzach (onderste balk)

  // === VERTICALE PADEN (Middenas) ===
  { from: 'keter', to: 'da_at', letter: '' },        // Keter ⟷ Da'at - kort, geen letter
  { from: 'da_at', to: 'tiferet', letter: 'ד' },     // Dalet - Da'at ⟷ Tif'eret (lange afstand)
  { from: 'tiferet', to: 'yesod', letter: 'ר' },    // Resj - Tif'eret ⟷ Yesod
  { from: 'yesod', to: 'malkuth', letter: 'ת' },    // Tav - Yesod ⟷ Malkhut (langste afstand)

  // === ZIJDE PADEN ===
  { from: 'binah', to: 'gevurah', letter: 'ג' },     // Gimel - Binah ⟷ Gevurah
  { from: 'gevurah', to: 'hod', letter: 'פ' },      // Pee - Gevurah ⟷ Hod
  { from: 'chokhmah', to: 'chesed', letter: 'ב' },  // Bet - Chokhmah ⟷ Chesed
  { from: 'chesed', to: 'netzach', letter: 'כ' },   // Kaf - Chesed ⟷ Netzach

  // === DIAGONALE PADEN ===
  { from: 'keter', to: 'binah', letter: 'ו' },       // Vav - Keter ⟷ Binah (links boven)
  { from: 'keter', to: 'chokhmah', letter: 'ה' },   // Hee - Keter ⟷ Chokhmah (rechts boven)
  { from: 'binah', to: 'da_at', letter: 'ק' },        // Kof - Binah ⟷ Da'at
  { from: 'binah', to: 'tiferet', letter: 'ע' },     // Ajin - Binah ⟷ Tif'eret
  { from: 'chokhmah', to: 'da_at', letter: 'ז' },   // Zajin - Chokhmah ⟷ Da'at
  { from: 'chokhmah', to: 'tiferet', letter: 'ט' },  // Tet - Chokhmah ⟷ Tif'eret
  { from: 'gevurah', to: 'da_at', letter: '' },     // Gevurah ⟷ Da'at - diagonaal, geen letter
  { from: 'chesed', to: 'da_at', letter: '' },      // Chesed ⟷ Da'at - diagonaal, geen letter
  { from: 'gevurah', to: 'tiferet', letter: 'צ' },   // Tsadie - Gevurah ⟷ Tif'eret
  { from: 'chesed', to: 'tiferet', letter: 'ח' },    // Chet - Chesed ⟷ Tif'eret
  { from: 'tiferet', to: 'hod', letter: 'ס' },       // Samech - Tif'eret ⟷ Hod
  { from: 'tiferet', to: 'netzach', letter: 'י' },   // Yod - Tif'eret ⟷ Netzach
  { from: 'hod', to: 'yesod', letter: 'ל' },          // Lamed - Hod ⟷ Yesod
  { from: 'netzach', to: 'yesod', letter: 'נ' },     // Noen - Netzach ⟷ Yesod
]

console.log('Paths count:', paths.length)