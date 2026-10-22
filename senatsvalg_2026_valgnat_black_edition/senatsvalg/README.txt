SENATSVALGET 2026 – LOKAL FILSTRUKTUR

Åbn index.html eller metode.html ved at dobbeltklikke. Ingen webserver, internetforbindelse, npm eller installation nødvendig. Bevar alle undermapper samlet.

FILER
index.html                Overblik og layout
metode.html               Metodeside og layout
data/polls.js             Central målingsdatabase i JavaScript, indlæses af begge sider
data/polls-export.json    Maskinlæsbar kopi af de aktuelle målingspunkter til import/backup (ikke anvendt i browseren)
css/overblik.css          Overblikkets styling
css/metode.css            Metodesidens styling
js/overblik.js            Overblikkets beregninger og interaktion
js/countdown.js           Nedtællingsur
js/metode-1.js            Interaktiv vægtningsillustration
js/metode-2.js            Interaktiv fremskrivningsillustration
js/metode-3.js            Modeltest og nye målinger (læser data/polls.js)
assets/                   Plads til fremtidige billeder (forsidebilledet er fortsat indlejret i index.html)

OPDATERING AF MÅLINGER
1. Tilføj observationer i MODEL.states[].points i data/polls.js. Hvert punkt indeholder x (startdato), end (slutdato), y (D-R margin), poll (institut).
2. Gem den tidligere tilstand i BASELINE_STATES, og juster UPDATE_AT, UPDATE_STATES og UPDATE_KEY for at vise ændringer i 48 timer.
3. Opdater data/polls-export.json ved import/eksport; filen bruges ikke i runtime.
4. Beregninger udføres ved sideindlæsning, så historiske afledte MODEL-felter erstattes dynamisk.

VIGTIGT
Det er en struktureret filbaseret database, IKKE en SQL-database. Ingen automatisk import eller synkronisering er implementeret. Der er endnu ingen fuld fælles regressionsmotor: overblik og metode har hver sine eksisterende beregningsfunktioner, som er bevaret for ikke at ændre resultaterne i denne migration.

NY FORSIDE (12. oktober 2026)
- index.html: billedforside med navigation til senatsvalg.html og metode.html.
- senatsvalg.html: tidligere dashboard (alle beregninger bevaret).
- metode.html: metode med afsluttende paraplyillustration.
- assets/: de to originale illustrationer.

Opdatering 13. oktober: Nedtonede sikre valg, fed serif-tekst uden kontur i 02, mørke chevroner, tydeligere lilla prognoseovergang, klassisk taltypografi i 03 og zoomscroll-beskyttelse.

Revision: Skravering er fjernet (også ved manglende målinger); lang valgrangering er skjult; navn og chevroner toner ind efter 01→02. Niveau 02 ellers uændret, indtil designforslaget er godkendt.

NY AUTOMATISK SANDSYNLIGHEDSMODEL (13. OKTOBER 2026)
- js/probability-model.js: Ren beregningsmotor for rolling-origin målings-backtests,
  normalfordelte betingede delstatsscenarier, fælles national fejl og
  Poisson-binomial mandatfordeling (uden eksterne biblioteker).
- js/scenario.js: Viser resultat for alle 35 valg, følsomhedsskydere og
  national opgørelse under afsnit 4.
- senatsvalg.html: 90 % standardantagelse om partitilhørsforhold for valg
  uden meningsmålinger og 2,0 pp national fælles følsomhed; begge kan ændres.
- metode.html#sandsynligheder: Regnestykker, forudsætninger, CV-metode,
  national samlet fordeling og væsentlige begrænsninger.

VIGTIGT: Modellen efterprøver fremskrivning mod fremtidige MÅLINGER,
ikke mod kendte VALGRESULTATER. Scenarieprocenterne er derfor IKKE
validerede valgsandsynligheder.
