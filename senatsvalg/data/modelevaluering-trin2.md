# Modelevaluering – trin 2 (foreløbig, 7. november 2026)

## Resultatkvalitet

- 35 registrerede resultater, 33 kaldte vindere, 2 uafgjorte (Alaska og Mississippi).
- Alle 35 marginer er internt konsistente med den gemte procentandel for D/I og R. Stemmeprocenter og registrerede stemmetal er internt konsistente ved en tolerance på 3 %.
- Resultatfilens stemmetal er en AP-baseret Fox News-snapshot fra 7. november kl. 01.59 ET, **ikke certificerede endelige valgresultater**. Sammenholdt med Fox News' samlede delstatsliste: https://www.foxnews.com/elections/2026/midterm-results/senate/ .
- AP har kaldt 33 valg og demokratisk kontrol med Senatet: https://www.ap.org/the-definitive-source/behind-the-news/calling-control-of-congress-in-the-2026-midterm-elections/ .
- Michigan: Fox/AP viser 2.520.388 mod 2.180.541, hvilket matcher GitHub. En separat delstatsbaseret opgørelse viser andre tal; dette er en kildekonflikt, som kræver afklaring før officiel certificering.
- Mississippi: GitHub viser D +0,27, men nyere AP-rapportering viser republikansk føring på omkring 2.500 stemmer; derfor må den ikke indgå som afgjort vinder. https://apnews.com/article/c911f244c12aa2f1f8e60b874bbe46d2
- Alaska: 74,09 % optalt i den gemte fil, og intet valgkald.
- Ingen rå stemmetal er ændret ved denne kontrol. Status: **foreløbigt kvalitetssikret snapshot**, ikke endeligt certificerede resultater.

## Sandsynlighedsmodel: reproduceret fra js/probability-model.js

Input: MODEL.states fra data/polls.js; samme 35 delstater; modelindstillinger `variant=classic, half=4, retain=0.90, shared=3`. Resultaterne er beregnet med `SenateProbabilityModel.compute`, både lige og tidsvægtede målinger. Modellen bruger rolling-origin-fejl mod senere målinger og eksterne horisontfaktorer; dette er ikke en dokumenteret arkiveret valgdagssimulering.

**Brier-score og vinderkorrekthed** beregnes kun på de 33 kaldte valg. Seks af disse har ingen meningsmålinger og anvender derfor modellens fastholdelsesantagelse (90 %). Tallene i parentes nedenfor er for de 27 kaldte valg med målinger.

| Vægtning | Model | Brier, 33 | Brier, 27 | Korrekte, 33 | Korrekte, 27 | 90 %-interval, 27 |
|---|---|---:|---:|---:|---:|---:|
| Lige | Lineær | 0,0597 | 0,0708 | 31/33 | 25/27 | 21/27 |
| Lige | Acceleration | 0,0604 | 0,0716 | 31/33 | 25/27 | 23/27 |
| Tidsvægtet, 4 uger | Lineær | 0,0570 | 0,0674 | 31/33 | 25/27 | 25/27 |
| Tidsvægtet, 4 uger | Acceleration | 0,0595 | 0,0705 | 31/33 | 25/27 | 27/27 |

90 %-intervallet er her `prognosticeret margin ± 1,64485 × sigma` for hver af de 27 kaldte delstater med målinger. Det er en marginal normalinterval-tilnærmelse, ikke en national 90 %-mandatintervaltest. Forventet dækning på 90 % kan ikke vurderes robust ud fra blot 27 delstater.

De to forkerte vinderforudsigelser blandt de kaldte valg er Iowa og South Carolina. Mississippi er uafgjort og derfor ikke medtaget som fejlagtigt vinderkald.

## Mandatmodel

AP har kaldt 33/35 valg, hvoraf syv er republikanske mandater, der er vundet af demokrater: Iowa, Kansas, Maine, North Carolina, Ohio, South Carolina og Texas. Det giver 54 D/I-mandater og 44 R-mandater **blandt de kaldte valg plus mandater, der ikke var på valg**, mens Alaska og Mississippi fortsat kan ændre totalen til 54–56 D/I-mandater. Dette er ikke en endelig national mandatfordeling.

| Vægtning | Model | Forventede D/I-mandater | 90 %-interval | P(D/I-flertal) | P(præcis 54 D/I) |
|---|---|---:|---|---:|---:|
| Lige | Lineær | 52,84 | 47–58 | 75,2 % | 10,99 % |
| Lige | Acceleration | 53,13 | 47–59 | 77,1 % | 10,92 % |
| Tidsvægtet | Lineær | 53,29 | 48–59 | 79,7 % | 11,59 % |
| Tidsvægtet | Acceleration | 53,66 | 48–59 | 81,9 % | 11,38 % |

Den hidtil sikre nedre grænse på 54 D/I ligger inden for alle fire 90 %-mandatintervaller. Endelig mandatfejl og sandsynlighed for præcist slutresultat kan først vurderes, når Alaska og Mississippi er afgjort. `P(præcis 54)` er kun modelmassens værdi for 54 og ikke en verificeret score for slutresultatet.

## Fortolkning og begrænsninger

- En lav Brier-score er positiv, men der er kun ét valg og 33 kendte udfald; fuld kalibrering kræver flere valg og historisk backtesting.
- Tidsvægtning gav marginalt bedre Brier-score end lige vægtning i begge varianter.
- Modellen vurderede D/I-flertal som mere sandsynligt end R-flertal før udfaldet, men disse tal er **retrospektivt rekonstruerede** fra nuværende database og indstillinger, ikke et verificeret historisk snapshot.
- Seks valg uden målinger får en antaget 90 %-fastholdelse. Dette skal holdes adskilt fra datadrevne prognoser.
- Uafhængige kandidater (ID, MT, NE, SD) kræver konsekvent D/I-partigruppering i alle beregninger; i denne rapport anvendes resultatfilens positive/negative margin og den eksisterende model.
- Endelig kvalitetskontrol kræver statsligt certificerede resultater, særlig afklaring af Michigan-kildekonflikten og Alaska/Mississippi.
- Kildekoden og rapporten er gemt separat; den offentlige resultatfil er ikke ændret.
