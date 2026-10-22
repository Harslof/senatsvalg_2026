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
  weight: 80,
  snapshot: null,
  exits: {
    // Eksempel (ikke aktivt):
    // "Ohio": { margin: 2, source: "Verificeret kilde", time: "2026-11-04T01:45" }
  }
};
