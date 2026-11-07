# Foreløbig historisk benchmark – 7. november 2026

## Eksisterende data: genberegning på samme 276 valg

Kilde: `senatsvalg/analyser/heldout_predictions.csv`, modellen `linear` og `accelerated`. Dette er **eksisterende historiske modeloutputs**; ikke en ny genkørsel på historiske råmålinger. Kohorten er snittet af valg med prognoser for 7, 14 og 28 dage før valget. Fortegn for `bias`: forecast minus actual (D–R).

| Dage før valg | Model | N valg | MAE, pp | Bias, pp |
|---:|---|---:|---:|---:|
| 28 | linear | 276 | 5.036558 | -0.418610 |
| 14 | linear | 276 | 4.410258 | -0.617559 |
| 7 | linear | 276 | 4.218399 | -0.401747 |
| 28 | accelerated | 276 | 7.284184 | 0.253075 |
| 14 | accelerated | 276 | 5.438708 | -1.301345 |
| 7 | accelerated | 276 | 4.408407 | -0.544473 |

Resultaterne er genberegnet fra de individuelle fejl i arkivet. Samme 276 valg bruges i hver horisont, så ændringerne i MAE ikke blot skyldes forskelle i valgudvalget. Disse modeller er **ikke** identiske med de tre kommende simple benchmarks (lige gennemsnit, tidsvægtning, lineær fremskrivning).

## Ny benchmark: 12/8/4/2 uger

Kør fra denne mappe (kræver pandas og numpy):

```bash
python import_historical.py /path/to/raw_polls.csv /path/to/1976-2024-senate-state.csv
python benchmark_horizons.py --polls historical_polls_538.csv --date-policy proxy --output benchmark-output
```

`benchmark_horizons.py` sammenligner tre simple regler ved hvert af 84, 56, 28 og 14 dage før valget:

1. `mean`: ligevægtet gennemsnit af tilgængelige målinger.
2. `time_weighted`: eksponentiel tidsvægtning (28 dages halveringstid).
3. `linear_trend`: tidsvægtet niveau plus en lineær udvikling frem mod valgdagen, maksimalt +/-2 procentpoint pr. uge.

Som udgangspunkt kræves mindst tre målinger og mindst 14 dages tidsmæssig spredning. Der dannes `predictions.csv`, `summary.csv`, `coverage.csv` og `run_manifest.json`. Samme valg sammenlignes på tværs af metoder inden for en horisont. Ved sammenligning af udviklingen **mellem** horisonter bør der igen filtreres til samme valgkohorte.

### Kvalitet og reproducerbarhed

- **Manglende råfiler:** `raw_polls.csv` og MIT's originale CSV er ikke indlagt i forecast-db. Det eksisterende importscript er derfor ikke alene nok til at genopbygge databasen fra repoet.
- **Mulig tidslækage:** FiveThirtyEight `polldate` er en midtdato for feltarbejdet; en måling kan være publiceret senere. `--date-policy proxy` er en følsomhedsanalyse, **ikke** en dokumenteret as-of-sikker test. `--date-policy strict` kræver verificerede `publication_date`-felter og udelader rækker uden disse.
- **Valgresultater:** `margin_actual` i FiveThirtyEight-filen er en historisk reference, ikke uafhængigt verificeret med officielle valgresultater. Brug ikke den endelige overskrift »valideret benchmark«, før valgdefinitions- og FEC/MIT-kontrol er afsluttet.
- **Særlige valg, runoff, fusion lines:** Racemapping fra rådata til MIT er ikke færdig. Resultatafvigelser og etårige særlige valg skal eksplicit håndteres; sammenfaldende tekst-ID er ikke dokumentation for, at det er samme valgrunde.
- **Modelparametre:** Halveringstider og trendlofter er på forhånd faste. Eventuel tuning skal senere udføres med holdout på hele valgår, ikke på det evaluerede valg.
- **Fremtidige faktorer:** Approval, incumbency, økonomi, acceleration, nationale udsving og simuleringer tilføjes først, når den simple benchmark har et verificeret datagrundlag.

Datakilder:
- FiveThirtyEight, `fivethirtyeight/data/pollster-ratings/raw_polls.csv`: https://github.com/fivethirtyeight/data/blob/master/pollster-ratings/raw_polls.csv
- MIT Election Data and Science Lab, US Senate 1976–2024: https://doi.org/10.7910/DVN/PEJ5QU

**Status:** benchmarkkode og retrospektiv arkivsammenligning er tilføjet, men 12/8/4/2-ugers benchmark på rå historiske polls er endnu ikke kørt på alle valg, og råfilerne er ikke uploadet. Ingen offentlig prognosekode er ændret.

## Ny empirisk benchmark: 538 råmålinger (proxy / 7. november 2026)

Datagrundlag: arkiveret FiveThirtyEight-blob `08735ea503ad64c67cfa285fd75c0a270fdca245` fra `fivethirtyeight/data`, `pollster-ratings/raw_polls.csv`. Råfilen er **læst fra kilderepositoriet, men ikke uploadet til vores repo** (connectorens store filupload fejlede). Der blev beregnet med samme algoritme som `benchmark_horizons.py`, dog uden at skrive en individuel `predictions.csv` til GitHub.

4.923 DEM/REP Sen-G poll-spørgsmål og 403 valg efter deduplikering på race, poll_id og question_id. Referenceutfald = FiveThirtyEight `margin_actual`. Prognosedato = valgdato minus 84, 56, 28 eller 14 dage. Målinger med `polldate` efter cutoff er udeladt. Krav: mindst 3 målinger over mindst 14 dage. `polldate` er **median-feltdato, ikke publiceringsdato**, så testen er ikke endeligt as-of-sikker.

**Dækning, alle tilgængelige valg pr. horisont:**
- 84 dage: 0 godkendte valg.
- 56 dage: 0 godkendte valg.
- 28 dage: 207 godkendte valg.
- 14 dage: 279 godkendte valg.

**Parret sammenligning af de 207 valg med datadækning ved både 28 og 14 dage:**

| Dage før | Model | N | MAE | Bias | RMSE |
|---:|---|---:|---:|---:|---:|
| 28 | mean | 207 | 5.149 | -0.188 | 6.588 |
| 28 | time_weighted | 207 | 5.070 | -0.151 | 6.529 |
| 28 | linear_trend | 207 | 5.190 | 0.075 | 6.682 |
| 14 | mean | 207 | 4.582 | 0.006 | 5.945 |
| 14 | time_weighted | 207 | 4.384 | 0.094 | 5.754 |
| 14 | linear_trend | 207 | 4.267 | 0.335 | 5.650 |

Filer: `benchmark_proxy_summary.csv`, `benchmark_proxy_paired.csv`, `benchmark_proxy_coverage.csv`. De to førstnævnte er aggregerede resultater. Ingen fuld historisk råfil er endnu commit'et til GitHub.

**Konklusion:** Tidsvægtning slår simpelt gennemsnit på begge tidspunkter. Lineær fremskrivning er dårligere end tidsvægtning 28 dage før, men bedre 14 dage før, i denne foreløbige test. Alle tre forbedres fra 28 til 14 dage på den parrede kohorte. Det kan ikke bruges som kausal dokumentation eller som endelig modelrangering uden verificerede offentliggørelsesdatoer, valgmatch og historisk holdout.

**Næste databehov:** En kilde med flere tidlige senatsmålinger, eksempelvis FiveThirtyEights historiske Senate Polls-arkiv, plus en uafhængigt verificeret race-mapping mod MIT/FEC. Genkør derefter 84/56/28/14-dages testen med fælles valgkohorter og behold historiske råfiler med kildehash og datoversion. Produktionen er uændret.
