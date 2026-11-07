# Modelevaluering – trin 1C: målingsantal og national korrektion

Foreløbig analyse af 29 delstater baseret på den tidsvægtede model i `modelevaluering-trin1.md`. Målefejl = prognose minus valgresultat; negativ bias er undervurdering af D/I. Tal afrundet.

## Fejl efter antal meningsmålinger

| Målinger | Delstater | MAE (pp) | Bias (pp) |
|---|---:|---:|---:|
| 1–3 | 7 | 7,44 | −6,56 |
| 4–9 | 5 | 5,57 | −1,47 |
| 10–24 | 10 | 5,81 | −1,44 |
| 25+ | 7 | 4,88 | −4,88 |

Pearson-korrelation mellem log(antal målinger) og absolut fejl: −0,197. Korrelation med fortegnet fejl: +0,074. Disse er beskrivende korrelationer, ikke kausale effekter.

## Retrospektiv national korrektion – leave-one-state-out

For delstat s estimeres den fælles bias fra de øvrige 28 delstater: b_{−s} = gennemsnit(prognose_j − resultat_j), j ≠ s. Den korrigerede prognose er prognose_s − b_{−s}. Korrektionerne var +3,18 til +4,10 pp D/I.

| Mål | Oprindelig | Korrigeret |
|---|---:|---:|
| MAE | 5,94 | 4,86 |
| RMSE | 6,99 | 6,26 |
| Korrekte vindere | 26/29 | 26/29 |

Iowa og South Carolina blev korrekte efter korrektion; Louisiana og Nebraska blev forkerte. Mississippi forblev forkert ifølge den aktuelle resultatfil.

**Vigtig begrænsning:** Dette er IKKE en out-of-sample før-valg-test. De øvrige delstaters valgresultater var ikke kendt før valget. En praktisk national korrektion skal estimeres ud fra tidligere valg, nationale meningsmålinger eller historiske rolling-origin-tests og derefter testes på holdout-valg.

**Datakvalitet:** Resultaterne i GitHubs `valgnat-feed.js` er foreløbige og enkelte afviger væsentligt fra nyere offentliggjorte optællinger (bl.a. Michigan). Ingen automatisk opdatering af resultatfilen er udført. Resultater med uafhængige kandidater kræver særskilt kontrol af marginfortolkning.

## Status i tretrinsplanen

- Trin 1: Gennemført foreløbigt (fire modeller, MAE, bias, RMSE, vinderkorrekthed, delstatsfejl, antal målinger, national korrektion); mangler resultatverifikation og arkiveret før-valg-snapshot.
- Trin 2: Ikke gennemført; mandatfordeling, Brier-score, kalibrering, konfidensintervaldækning.
- Trin 3: Ikke påbegyndt; offentlig `evaluering.html` og topnavigation oprettes efter trin 2.
