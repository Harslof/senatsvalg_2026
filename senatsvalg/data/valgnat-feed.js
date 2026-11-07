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
  resultsUpdatedAt: "2026-11-07T01:59:00-05:00",
  // Opdateret fra brugerens seneste skærmbilleder (intet tidspunkt angivet).
  // Disse er optalte valgresultater, IKKE exitpolls. Margener i procentpoint.
  // Ved uafhængige kandidater (NE, ID, MT, SD) måles R mod stærkeste modkandidat.
  // Flueben i kilden => called: true. Ingen flueben => false.
  results: {
  "Alabama": {
    "margin": -9.42,
    "dem": 45.29,
    "rep": 54.71,
    "other": 0,
    "percentIn": "98.97",
    "called": true,
    "repVotes": 917347,
    "source": "Fox News, 7 November 2026",
    "demVotes": 759336
  },
  "Alaska": {
    "margin": 0.29,
    "dem": 48.17,
    "rep": 47.88,
    "other": 3.95,
    "percentIn": "74.09",
    "called": false,
    "repVotes": 102325,
    "source": "Fox News, 7 November 2026",
    "demVotes": 102962
  },
  "Arkansas": {
    "margin": -11.85,
    "dem": 42.41,
    "rep": 54.26,
    "other": 3.33,
    "percentIn": "99",
    "called": true,
    "repVotes": 480627,
    "source": "Fox News, 7 November 2026",
    "demVotes": 375647
  },
  "Colorado": {
    "margin": 25.27,
    "dem": 60.38,
    "rep": 35.11,
    "other": 4.51,
    "percentIn": "97.43",
    "called": true,
    "repVotes": 930787,
    "source": "Fox News, 7 November 2026",
    "demVotes": 1600935
  },
  "Delaware": {
    "margin": 27.14,
    "dem": 63.57,
    "rep": 36.43,
    "other": 0,
    "percentIn": "99",
    "called": true,
    "repVotes": 137764,
    "source": "Fox News, 7 November 2026",
    "demVotes": 240347
  },
  "Florida": {
    "margin": -2.88,
    "dem": 47.99,
    "rep": 50.87,
    "other": 1.14,
    "percentIn": "99",
    "called": true,
    "repVotes": 4210242,
    "source": "Fox News, 7 November 2026",
    "demVotes": 3972095,
    "special": true
  },
  "Georgia": {
    "margin": 18.04,
    "dem": 59.02,
    "rep": 40.98,
    "other": 0,
    "percentIn": "99",
    "called": true,
    "repVotes": 1712444,
    "source": "Fox News, 7 November 2026",
    "demVotes": 2466422
  },
  "Idaho": {
    "margin": -22.99,
    "dem": 0,
    "rep": 56.53,
    "other": 33.54,
    "percentIn": "98.96",
    "called": true,
    "repVotes": 401788,
    "source": "Fox News, 7 November 2026",
    "otherVotes": 238352,
    "marginBasis": "R minus strongest opponent"
  },
  "Illinois": {
    "margin": 24.28,
    "dem": 61.35,
    "rep": 37.07,
    "other": 1.58,
    "percentIn": "95.79",
    "called": true,
    "repVotes": 1510621,
    "source": "Fox News, 7 November 2026",
    "demVotes": 2499776
  },
  "Iowa": {
    "margin": 4.11,
    "dem": 50.51,
    "rep": 46.4,
    "other": 3.09,
    "percentIn": "98.99",
    "called": true,
    "repVotes": 630808,
    "source": "Fox News, 7 November 2026",
    "demVotes": 686641
  },
  "Kansas": {
    "margin": 5.06,
    "dem": 51.02,
    "rep": 45.96,
    "other": 3.02,
    "percentIn": "98.88",
    "called": true,
    "repVotes": 505558,
    "source": "Fox News, 7 November 2026",
    "demVotes": 561143
  },
  "Kentucky": {
    "margin": -12.09,
    "dem": 42.91,
    "rep": 55,
    "other": 2.09,
    "percentIn": "99",
    "called": true,
    "repVotes": 784869,
    "source": "Fox News, 7 November 2026",
    "demVotes": 612357
  },
  "Louisiana": {
    "margin": -1.76,
    "dem": 49.12,
    "rep": 50.88,
    "other": 0,
    "percentIn": "99",
    "called": true,
    "repVotes": 745963,
    "source": "Fox News, 7 November 2026",
    "demVotes": 720106
  },
  "Maine": {
    "margin": 6.29,
    "dem": 53.11,
    "rep": 46.82,
    "other": 0.07,
    "percentIn": "93.58",
    "called": true,
    "repVotes": 330994,
    "source": "Fox News, 7 November 2026",
    "demVotes": 375516
  },
  "Massachusetts": {
    "margin": 31.24,
    "dem": 63.39,
    "rep": 32.15,
    "other": 4.46,
    "percentIn": "98.99",
    "called": true,
    "repVotes": 837152,
    "source": "Fox News, 7 November 2026",
    "demVotes": 1650772
  },
  "Michigan": {
    "margin": 7.08,
    "dem": 52.54,
    "rep": 45.46,
    "other": 2,
    "percentIn": "98.13",
    "called": true,
    "repVotes": 2180541,
    "source": "Fox News, 7 November 2026",
    "demVotes": 2520388
  },
  "Minnesota": {
    "margin": 10.15,
    "dem": 53.71,
    "rep": 43.56,
    "other": 2.73,
    "percentIn": "98.85",
    "called": true,
    "repVotes": 1233467,
    "source": "Fox News, 7 November 2026",
    "demVotes": 1520871
  },
  "Mississippi": {
    "margin": 0.27,
    "dem": 49.08,
    "rep": 48.81,
    "other": 2.11,
    "percentIn": "96.92",
    "called": false,
    "repVotes": 465356,
    "source": "Fox News, 7 November 2026",
    "demVotes": 467930
  },
  "Montana": {
    "margin": -10.63,
    "dem": 0,
    "rep": 48.32,
    "other": 37.69,
    "percentIn": "97.65",
    "called": true,
    "repVotes": 232916,
    "source": "Fox News, 7 November 2026",
    "otherVotes": 181674,
    "marginBasis": "R minus strongest opponent"
  },
  "Nebraska": {
    "margin": -6.23,
    "dem": 0,
    "rep": 50.14,
    "other": 43.91,
    "percentIn": "97.12",
    "called": true,
    "repVotes": 378281,
    "source": "Fox News, 7 November 2026",
    "otherVotes": 331268,
    "marginBasis": "R minus strongest opponent"
  },
  "New Hampshire": {
    "margin": 13.74,
    "dem": 55.92,
    "rep": 42.18,
    "other": 1.9,
    "percentIn": "98.93",
    "called": true,
    "repVotes": 268340,
    "source": "Fox News, 7 November 2026",
    "demVotes": 355720
  },
  "New Jersey": {
    "margin": 27.27,
    "dem": 62.34,
    "rep": 35.07,
    "other": 2.59,
    "percentIn": "96.36",
    "called": true,
    "repVotes": 1023549,
    "source": "Fox News, 7 November 2026",
    "demVotes": 1819769
  },
  "New Mexico": {
    "margin": 26.52,
    "dem": 63.26,
    "rep": 36.74,
    "other": 0,
    "percentIn": "98.47",
    "called": true,
    "repVotes": 266434,
    "source": "Fox News, 7 November 2026",
    "demVotes": 458756
  },
  "North Carolina": {
    "margin": 19.63,
    "dem": 58.72,
    "rep": 39.09,
    "other": 2.19,
    "percentIn": "99",
    "called": true,
    "repVotes": 1643114,
    "source": "Fox News, 7 November 2026",
    "demVotes": 2467972
  },
  "Ohio": {
    "margin": 4.86,
    "dem": 50.01,
    "rep": 45.15,
    "other": 4.84,
    "percentIn": "97.75",
    "called": true,
    "repVotes": 2077748,
    "source": "Fox News, 7 November 2026",
    "demVotes": 2301042,
    "special": true
  },
  "Oklahoma": {
    "margin": -17.92,
    "dem": 39.28,
    "rep": 57.2,
    "other": 3.52,
    "percentIn": "99",
    "called": true,
    "repVotes": 639510,
    "source": "Fox News, 7 November 2026",
    "demVotes": 439109
  },
  "Oregon": {
    "margin": 19.43,
    "dem": 58.08,
    "rep": 38.65,
    "other": 3.27,
    "percentIn": "88.73",
    "called": true,
    "repVotes": 719976,
    "source": "Fox News, 7 November 2026",
    "demVotes": 1081831
  },
  "Rhode Island": {
    "margin": 37.46,
    "dem": 66.75,
    "rep": 29.29,
    "other": 3.96,
    "percentIn": "98.19",
    "called": true,
    "repVotes": 105346,
    "source": "Fox News, 7 November 2026",
    "demVotes": 240069
  },
  "South Carolina": {
    "margin": 4.5,
    "dem": 51.14,
    "rep": 46.64,
    "other": 2.22,
    "percentIn": "99",
    "called": true,
    "repVotes": 951904,
    "source": "Fox News, 7 November 2026",
    "demVotes": 1043719
  },
  "South Dakota": {
    "margin": -21,
    "dem": 0,
    "rep": 60.5,
    "other": 39.5,
    "percentIn": "99",
    "called": true,
    "repVotes": 184589,
    "source": "Fox News, 7 November 2026",
    "otherVotes": 120509,
    "marginBasis": "R minus strongest opponent"
  },
  "Tennessee": {
    "margin": -12.17,
    "dem": 42.91,
    "rep": 55.08,
    "other": 2.01,
    "percentIn": "99",
    "called": true,
    "repVotes": 1138457,
    "source": "Fox News, 7 November 2026",
    "demVotes": 886974
  },
  "Texas": {
    "margin": 12.1,
    "dem": 55.09,
    "rep": 42.99,
    "other": 1.92,
    "percentIn": "99",
    "called": true,
    "repVotes": 4250166,
    "source": "Fox News, 7 November 2026",
    "demVotes": 5446309
  },
  "Virginia": {
    "margin": 22.66,
    "dem": 61.2,
    "rep": 38.54,
    "other": 0.26,
    "percentIn": "97.77",
    "called": true,
    "repVotes": 1378325,
    "source": "Fox News, 7 November 2026",
    "demVotes": 2188657
  },
  "West Virginia": {
    "margin": -20.42,
    "dem": 37.91,
    "rep": 58.33,
    "other": 3.76,
    "percentIn": "99",
    "called": true,
    "repVotes": 266067,
    "source": "Fox News, 7 November 2026",
    "demVotes": 172922
  },
  "Wyoming": {
    "margin": -30.48,
    "dem": 34.76,
    "rep": 65.24,
    "other": 0,
    "percentIn": "96.95",
    "called": true,
    "repVotes": 122157,
    "source": "Fox News, 7 November 2026",
    "demVotes": 65097
  }
},
    exits: {
    // Eksempel (ikke aktivt):
    // "Ohio": { margin: 2, source: "Verificeret kilde", time: "2026-11-04T01:45" }
  }
};
