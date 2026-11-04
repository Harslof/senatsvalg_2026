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
  resultsUpdatedAt: '2026-11-04T06:56:00+01:00',
  // Resultater kan rettes enkeltvis. margin: D positiv, R negativ.
  // called: valg afgjort (flueben i kilden). percentIn: tal eller '>95'.
  // Mississippi er vist som D <0,01; margin er derfor null, leader 'D'.
  results: {
    "Georgia": { margin: 18, percentIn: ">95", called: true },
    "Michigan": { margin: 3, percentIn: "65", called: false },
    "Minnesota": { margin: 11, percentIn: "93", called: true },
    "New Hampshire": { margin: 14, percentIn: "89", called: true },
    "North Carolina": { margin: 20, percentIn: ">95", called: true },
    "Florida": { margin: -3, percentIn: ">95", called: true, special: true },
    "Mississippi": { margin: null, leader: 'D', marginLabel: 'D <0,01', percentIn: ">95", called: false },
    "Nebraska": { margin: -3, percentIn: "70", called: false },
    "South Carolina": { margin: 4, percentIn: ">95", called: true },
    "Colorado": { margin: 25, percentIn: "84", called: true },
    "Delaware": { margin: 27, percentIn: ">95", called: true },
    "Illinois": { margin: 24, percentIn: "87", called: true },
    "Massachusetts": { margin: 34, percentIn: "60", called: true },
    "New Jersey": { margin: 27, percentIn: "95", called: true },
    "New Mexico": { margin: 26, percentIn: ">95", called: true },
    "Oregon": { margin: 18, percentIn: "76", called: true },
    "Rhode Island": { margin: 37, percentIn: "93", called: true },
    "Virginia": { margin: 21, percentIn: "95", called: true },
    "Alabama": { margin: -11, percentIn: "94", called: true },
    "Arkansas": { margin: -12, percentIn: ">95", called: true },
    "Idaho": { margin: -15, percentIn: "60", called: false },
    "Kentucky": { margin: -12, percentIn: ">95", called: true },
    "Louisiana": { margin: -1.8, percentIn: ">95", called: true },
    "Montana": { margin: -7, percentIn: "54", called: false },
    "Oklahoma": { margin: -18, percentIn: ">95", called: true },
    "South Dakota": { margin: -23, percentIn: "77", called: true },
    "Tennessee": { margin: -12, percentIn: ">95", called: true },
    "West Virginia": { margin: -20, percentIn: ">95", called: true },
    "Wyoming": { margin: -28, percentIn: "90", called: true }
  },
  exits: {
    // Eksempel (ikke aktivt):
    // "Ohio": { margin: 2, source: "Verificeret kilde", time: "2026-11-04T01:45" }
  }
};
