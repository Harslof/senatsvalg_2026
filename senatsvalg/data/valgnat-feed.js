/* PUBLICERINGSFIL – REDIGERES BAGFRA, ALDRIG PÅ SELVE VISNINGSSIDEN.
   D/I-margin er positiv; republikansk margin er negativ.
   Kandidatopdelte exitpolls alene; ingen nationale vælgerprofil-tal.
   snapshot: null betyder aktuelle marginer fra data/polls.js.
   For at fastholde kl. 23-grundlaget: indsæt et komplet snapshot med 35
   poster {state, inc, margin, count} fra polls.js før senere opdateringer.
   Opdater filen og genudgiv for at ændre dashboardet for alle besøgende.
*/
window.VALGNAT_FEED = {
  updatedAt: null,
  weight: 50,
  snapshot: null,
  resultsUpdatedAt: null,
  // Opdateret fra brugerens seneste skærmbilleder (intet tidspunkt angivet).
  // Disse er optalte valgresultater, IKKE exitpolls. Margener i procentpoint.
  // Ved uafhængige kandidater (NE, ID, MT, SD) måles R mod stærkeste modkandidat.
  // Flueben i kilden => called: true. Ingen flueben => false.
  results: {
    "Alaska": { margin: 11, dem: 54, rep: 43, other: 2, percentIn: "22", called: false },
    "Iowa": { margin: 4, dem: 50, rep: 46, other: 3, percentIn: "97", called: true },
    "Kansas": { margin: 5, dem: 51, rep: 46, other: 3, percentIn: "94", called: true },
    "Maine": { margin: 6, dem: 53, rep: 47, other: 0, percentIn: "72", called: true },
    "Ohio": { margin: 3, dem: 49, rep: 46, other: 3, percentIn: "91", called: true },
    "Michigan": { margin: 6, dem: 52, rep: 46, other: 1, percentIn: "77", called: false },
    "Minnesota": { margin: 11, dem: 54, rep: 43, other: 1, percentIn: "93", called: true },
    "New Hampshire": { margin: 14, dem: 56, rep: 42, other: 2, percentIn: "85", called: true },
    "Texas": { margin: 12, dem: 55, rep: 43, other: 2, percentIn: "87", called: true },
    "Nebraska": { margin: -4, dem: 0, rep: 49, other: 45, percentIn: "72", called: false, marginBasis: "R minus strongest opponent" },
    "South Carolina": { margin: 4, dem: 51, rep: 47, other: 1, percentIn: "95", called: true },
    "Georgia": { margin: 18, dem: 59, rep: 41, other: 0, percentIn: "96", called: true },
    "North Carolina": { margin: 20, dem: 59, rep: 39, other: 1, percentIn: "99", called: true },
    "Florida": { margin: -3, dem: 48, rep: 51, other: 1, percentIn: "99", called: true, special: true },
    "Louisiana": { margin: -2, dem: 49, rep: 51, other: null, percentIn: "99", called: true },
    "Mississippi": { margin: null, dem: 48.9, rep: 48.9, other: 2, percentIn: "97", called: false, marginLabel: "D 48,9 % · R 48,9 %" },
    "Colorado": { margin: 26, dem: 61, rep: 35, other: 3, percentIn: "74", called: true },
    "Delaware": { margin: 28, dem: 64, rep: 36, other: null, percentIn: "99", called: true },
    "Illinois": { margin: 24, dem: 61, rep: 37, other: 2, percentIn: "87", called: true },
    "Massachusetts": { margin: 33, dem: 64, rep: 31, other: 2, percentIn: "63", called: true },
    "New Jersey": { margin: 27, dem: 62, rep: 35, other: 2, percentIn: "92", called: true },
    "New Mexico": { margin: 26, dem: 63, rep: 37, other: null, percentIn: "96", called: true },
    "Oregon": { margin: 17, dem: 57, rep: 40, other: 2, percentIn: "68", called: true },
    "Rhode Island": { margin: 38, dem: 67, rep: 29, other: 4, percentIn: "94", called: true },
    "Virginia": { margin: 22, dem: 61, rep: 39, other: 0, percentIn: "96", called: true },
    "Alabama": { margin: -10, dem: 45, rep: 55, other: null, percentIn: "96", called: true },
    "Arkansas": { margin: -12, dem: 42, rep: 54, other: 3, percentIn: "99", called: true },
    "Idaho": { margin: -18, dem: 0, rep: 54, other: 36, percentIn: "75", called: true, marginBasis: "R minus strongest opponent" },
    "Kentucky": { margin: -12, dem: 43, rep: 55, other: 2, percentIn: "99", called: true },
    "Montana": { margin: -8, dem: 12, rep: 47, other: 39, percentIn: "71", called: false, marginBasis: "R minus strongest opponent" },
    "Oklahoma": { margin: -18, dem: 39, rep: 57, other: 1, percentIn: "97", called: true },
    "South Dakota": { margin: -22, dem: 0, rep: 61, other: 39, percentIn: "78", called: true, marginBasis: "R minus strongest opponent" },
    "Tennessee": { margin: -12, dem: 43, rep: 55, other: 0, percentIn: "99", called: true },
    "West Virginia": { margin: -20, dem: 38, rep: 58, other: 4, percentIn: "93", called: true },
    "Wyoming": { margin: -30, dem: 35, rep: 65, other: null, percentIn: "90", called: true }
  },
  exits: {
    // Eksempel (ikke aktivt):
    // "Ohio": { margin: 2, source: "Verificeret kilde", time: "2026-11-04T01:45" }
  }
};
