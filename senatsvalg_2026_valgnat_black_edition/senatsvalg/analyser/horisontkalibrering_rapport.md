# Horisontkalibrering med historiske valgår holdt ude

Datagrundlag: FiveThirtyEight raw_polls.csv (senatsvalg, 1998–2022). Grundtesten rekonstruerer prognoser 7, 14 og 28 dage før valget. Et valgår ad gangen holdes ude. Faktoren tilpasses på alle de øvrige år ved at finde den mindste faktor, hvor mindst 90 % af træningsobservationernes faktiske valgmargin ligger inden for modellens symmetriske normalfordelte 90 %-interval. Faktoren ganges på den eksisterende delstats-sigma; den fælles nationale komponent på 3,0 pp holdes fast og lægges til i kvadratur. Derefter vurderes dækning, logscore og Brier-score på det udeladte år. Denne proces gentages for hvert år.

| Model | Dage | Valg | 90 % før | 90 % efter | Medianfaktor | Logscore før | Logscore efter | Brier før | Brier efter |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| accelerated | 7 | 357 | 80,7 % | 90,2 % | 1.428 | 3.422 | 3.333 | 0.060 | 0.062 |
| accelerated | 14 | 336 | 90,2 % | 89,9 % | 0.977 | 3.476 | 3.486 | 0.075 | 0.075 |
| accelerated | 28 | 276 | 86,2 % | 90,2 % | 1.161 | 3.835 | 3.815 | 0.116 | 0.116 |
| linear | 7 | 357 | 81,8 % | 89,9 % | 1.488 | 3.342 | 3.281 | 0.057 | 0.059 |
| linear | 14 | 336 | 91,7 % | 89,9 % | 0.793 | 3.335 | 3.334 | 0.066 | 0.065 |
| linear | 28 | 276 | 95,7 % | 89,9 % | 0.652 | 3.407 | 3.327 | 0.084 | 0.079 |

**Vigtige begrænsninger:** Faktorerne er tilpasset separat for 7, 14 og 28 dage, ikke som en sammenhængende funktion for alle tidshorisonter. Faktorerne er estimeret med de samme historiske datatyper, som evalueringen bruger, men ingen testårs udfald er brugt i netop det års træningsfold. Den fælles nationale fejl på 3 pp er fast og er ikke genestimeret. Testen er en rekonstruktion af modellen, ikke en identisk afvikling af hele webapplikationen; blandt andet mangler feltdato-intervaller i de historiske data, og delstatslokale historiske fejlestimater er udeladt. De historiske valg er korrelerede på tværs af delstater og prognosedatoer. En næsten perfekt samlet 90 %-dækning er ikke ensbetydende med korrekte vinderchancer eller korrekt national mandatfordeling. Tjek også logscore og Brier-score, der ikke forbedres i alle grupper.

**Status:** Ingen ændringer i hjemmesidens sandsynlighedsmodel. De historisk estimerede faktorer præsenteres som en valideret følsomhedsanalyse, ikke en produktionsparameter.

**Reproducerbarhed:** `beregn_horisontfaktorer.py` læser `forecasts.csv` fra den medfølgende ZIP `historisk_modeltest_grundlag.zip`; pak grundlags-ZIP ud i `/mnt/data/historical_full_test/` eller tilpas inputstien i scriptet. Output er `heldout_predictions.csv`, `heldout_factors.csv` og `summary.csv`.
