# Modelevaluering – trin 1 (foreløbig)

Beregnet på GitHub-data i `data/polls.js` og `data/valgnat-feed.js` pr. 7. november 2026. **Dette er en retrospektiv beregning, ikke en dokumenteret fastfrosset prognose fra før valget.** Målingernes feltmidtpunkter er begrænset til valgdagen; registreringstidspunkter for offentliggørelse er ikke fuldt verificeret. Alaska og Mississippi er endnu ikke erklæret afgjort i resultatfilen (*). Alle delstater uden målinger er udeladt af de fælles fejlmål.

## Sammenligning

| Model | Antal valg | MAE (pp) | Bias (pp) | RMSE (pp) | Korrekte vindere |
|---|---:|---:|---:|---:|---:|
| Gennemsnit | 29 | 6.46 | -4.00 | 7.51 | 26/29 |
| Tidsvægtet (4 uger) | 29 | 5.94 | -3.51 | 6.99 | 26/29 |
| Lineær fremskrivning | 29 | 6.24 | -3.79 | 7.25 | 26/29 |
| Trend + acceleration | 29 | 6.20 | -3.74 | 7.20 | 26/29 |

**Definitioner:** Positiv margin = D/I-føring; negativ = R-føring. Fejl = prognose minus valgresultat. MAE er gennemsnitlig absolut fejl; bias er gennemsnitlig fortegnet fejl; RMSE er kvadratrod af gennemsnitlig kvadreret fejl. Korrekte vindere er korrekt fortegn af marginen. Samme 29 delstater sammenlignes for alle modeller.

## Modeller

- Gennemsnit: alle registrerede målinger vægtes ens.
- Tidsvægtet: halveringstid fire uger, beregnet ud fra målingernes feltmidtpunkter.
- Lineær: ligevægtet gennemsnit plus lineær regressionshældning ganget med antal uger fra seneste målings feltmidte til 3. november kl. 12 UTC.
- Acceleration: lineær fremskrivning plus kvadratisk led (0,5 × acceleration × uger²); ved utilstrækkelige målinger falder modellen tilbage til lineær eller gennemsnit.

Disse beregninger følger den klassiske models logik i `js/overblik.js`. Den eksperimentelle model evalueres særskilt senere. De fire modeller sammenlignes på identiske delstater; ingen resultatdata indgår i modelberegningerne.

## Delstater

| Delstat | Målinger | Resultat | Gennemsnit | Tidsvægtet | Lineær | Acceleration |
|---|---:|---:|---:|---:|---:|---:|
| Alabama | 5 | -9.42 | -16.00 | -15.26 | -15.89 | -15.35 |
| Alaska * | 18 | 0.29 | 2.33 | 1.83 | 2.30 | 2.30 |
| Arkansas | 7 | -11.85 | -10.57 | -11.68 | -10.35 | -10.39 |
| Colorado | 2 | 25.27 | 16.00 | 16.52 | 16.00 | 16.00 |
| Delaware | 0 | 27.14 | — | — | — | — |
| Florida | 27 | -2.88 | -6.37 | -5.84 | -6.25 | -6.26 |
| Georgia | 16 | 18.04 | 7.75 | 7.90 | 7.76 | 7.76 |
| Idaho | 7 | -22.99 | -14.57 | -13.96 | -14.86 | -14.83 |
| Illinois | 3 | 24.28 | 13.67 | 13.27 | 13.67 | 13.67 |
| Iowa | 36 | 4.11 | -0.14 | -0.28 | -0.13 | -0.13 |
| Kansas | 20 | 5.06 | 1.35 | 2.95 | 1.56 | 1.57 |
| Kentucky | 1 | -12.09 | -9.00 | -9.00 | -9.00 | -9.00 |
| Louisiana | 4 | -1.76 | -2.00 | -0.73 | -1.83 | -1.82 |
| Maine | 30 | 6.29 | 3.00 | 3.25 | 2.98 | 3.00 |
| Massachusetts | 13 | 31.24 | 23.92 | 24.91 | 23.93 | 23.93 |
| Michigan | 57 | 7.08 | 2.61 | 3.60 | 2.68 | 2.68 |
| Minnesota | 19 | 10.15 | 4.53 | 5.12 | 4.55 | 4.56 |
| Mississippi * | 3 | 0.27 | -4.33 | -3.66 | -3.86 | -3.68 |
| Montana | 13 | -10.63 | -7.62 | -7.21 | -7.69 | -7.66 |
| Nebraska | 17 | -6.23 | -1.00 | -2.33 | -1.06 | -1.07 |
| New Hampshire | 20 | 13.74 | 5.15 | 6.75 | 5.27 | 5.28 |
| New Jersey | 0 | 27.27 | — | — | — | — |
| New Mexico | 2 | 26.52 | 16.50 | 17.10 | 19.72 | 19.72 |
| North Carolina | 40 | 19.63 | 9.35 | 10.15 | 9.41 | 9.41 |
| Ohio | 42 | 4.86 | 3.02 | 3.19 | 3.06 | 3.05 |
| Oklahoma | 1 | -17.92 | -21.00 | -21.00 | -21.00 | -21.00 |
| Oregon | 0 | 19.43 | — | — | — | — |
| Rhode Island | 6 | 37.46 | 22.00 | 25.70 | 23.40 | 23.95 |
| South Carolina | 12 | 4.50 | -1.92 | -1.13 | -1.73 | -1.73 |
| South Dakota | 11 | -21.00 | -8.36 | -8.02 | -8.21 | -8.21 |
| Tennessee | 1 | -12.17 | -25.00 | -25.00 | -25.00 | -25.00 |
| Texas | 70 | 12.10 | 2.69 | 2.97 | 2.70 | 2.70 |
| Virginia | 0 | 22.66 | — | — | — | — |
| West Virginia | 0 | -20.42 | — | — | — | — |
| Wyoming | 0 | -30.48 | — | — | — | — |

## Forbehold

- Resultaterne er foreløbige; alle 35 delstater har en registreret margin, men ikke alle er endeligt afgjort.
- For delstater med uafhængig kandidat anvendes datafilens margin mod republikaneren, men denne definition skal kontrolleres særligt inden endelig evaluering.
- Det historiske datagrundlag er den nuværende version af målingsdatabasen, ikke et arkiveret valgdagssnapshot. Vi skal efterprøve, at alle målinger faktisk var offentliggjort før prognosetidspunktet.
- Dette trin omfatter ikke Brier-score, mandatfordeling eller konfidensintervaller.
