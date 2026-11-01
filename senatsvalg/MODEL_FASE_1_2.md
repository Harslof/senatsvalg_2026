# Fase 1–2: modelrevision (arbejdsbranch)

## Status og sikkerhed
Dette er en isoleret udviklingsbranch. Hjemmesidens aktive beregninger er ikke ændret. `js/forecast-candidates.js` er ikke indlæst af nogen HTML-side.

## Kortlægning af eksisterende kode
- `js/forecast-experiment.js`: klassisk/eksperimentel variant, relative huseffekter, tidsvægtning, fælles indstillinger og mættet fremskrivningshorisont.
- `js/probability-model.js`: lineær/accelereret fremskrivning, rolling-origin test mod **senere målinger**, usikkerhedskalibrering, national fællesfejl og mandatfordeling.
- `js/overblik.js`: særskilt WLS-beregning; skal kontrolleres for parity med modelmotoren.
- `metode.html`: eksisterende modelværksted og forklaringer; bør udbygges frem for erstattes.

## Vigtige fund
1. Den løbende backtest i sandsynlighedsmotoren sammenligner med senere målinger, ikke faktiske valgresultater.
2. National fællesfejl er sat til 3 procentpoint i forsøgsindstillingerne; regionale fejl er ikke modelleret.
3. Umålte valg bruger en antagelse om 90 % fastholdelse.
4. Huseffekter er relative til andre 2026-målinger, ikke historisk dokumenterede valgfejl.
5. Det eksperimentelle forecast bruger `4*(1-exp(-h/4))` som effektiv horisont; det er ikke det samme som integreret eksponentielt aftagende trend.
6. `probability-model.js` anvender `Date.now()` og faste 2026-valgdatoer; historisk backtest kræver en eksplicit prognosedato og historiske valgdatoer.

## Fase 2: Kandidatmodeller
`js/forecast-candidates.js` indeholder rene, uafhængige funktioner til:
- eksisterende lineær og kvadratisk ekstrapolation;
- integreret eksponentielt aftagende trend med justerbar tau;
- kombination af målingsprognose og historisk prior **kun med eksplicit kalibreret vægt**;
- rolling-origin test mod senere målinger.

Ingen historiske valgresultater eller approval-data er opfundet. Ingen optimal tau eller prior-vægt er endnu estimeret. En rolling-origin test mod senere målinger kan ikke alene validere en valgprognose.

## Før aktivering
1. Hent og verificér historiske resultater og tidsstemplede målinger for flere valgår.
2. Byg as-of backtest, der holder hele valgår ude af træningen.
3. Sammenlign lineær, kvadratisk og aftagende trend på MAE og stabilitet, også 2/7/14/30 dage før valget.
4. Test historisk prior, incumbency, approval og huseffekter som selvstændige tilføjelser.
5. Læg enhedstests og parity-tests på tværs af hovedside, præsentation og sandsynlighedsmotor.
6. Først efter dokumenteret forbedring: tilføj modelvælger og forbind kandidatmodellen til UI.

## Kendt begrænsning
Dette er en kodekortlægning af de centrale moduler, ikke endnu en fuldstændig linje-for-linje revision af alle projektfiler.
