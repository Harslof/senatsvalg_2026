# Opdateringsindikatorer

`js/update-indicators.js` samler 48-timers aktivering, lilla prikker og retningsbestemte pile.

- `SenateUpdateUI.mark(changed, title)` bruges ved nye målinger, ændret partiføring og andre kategoriske ændringer.
- `SenateUpdateUI.change(now, before, title)` viser ↑ eller ↓ for numeriske ændringer, ellers en prik hvis et tal tilføjes/fjernes.
- Pilen betyder, at den **viste værdi** stiger/falder, ikke at et bestemt parti vinder.
- `MODEL.states` sammenlignes med `BASELINE_STATES` fra `data/polls.js`. Sidstnævnte er et fast snapshot før de 17 nye observationer fra 20. oktober.
- `js/scenario.js` genberegner sandsynlighedsmodellen på begge datasæt med identiske vægtningsindstillinger og markerer ændringer i nationale flertalschancer og delstaters vinderchancer.
- `js/overblik.js` bruger modulet i tabeller, mandatoversigt, nationale trendtal og valg i spil.
- `js/seat-importance.js` viser de aktuelle modelresultater, men ingen opdateringspile: delstatens betingede mandatbetydning kan ændre sig som følge af ændringer i *andre* delstater. En fuldstændig før/efter-sammenligning af alle 35 delstater for hvert mål kræver yderligere beregninger og er ikke implementeret her.

**Begrænsninger:** Den nationale sandsynlighed vises i overblikket som et interval mellem to modeller. Pilen dér viser retningen af gennemsnittet af de to sandsynligheder; de enkelte modellers retninger vises særskilt i sandsynlighedsmodulet. Der er ikke foretaget en fuld visuel browsertest.
