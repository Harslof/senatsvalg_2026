# Historisk prognosedatabase (version 0.1)

## Formål
Samle meningsmålinger, valgresultater, historiske grundprognoser, incumbency, approval, kampagneøkonomi og økonomiske indikatorer til **as-of-sikre** historiske tests. Denne mappe er et **dataskema og en registreringsramme**, ikke en færdig indsamlet database. Ingen produktionsmodel ændres.

## Eksisterende data i repository

| Data | Eksisterende kilde | Anvendelse / forbehold |
|---|---|---|
| 2026 målinger | `../polls.js`, `../polls-export.json` | Målingsdatabase; `added` er registrering, ikke sikker publiceringsdato |
| 2026 valgresultater | `../valgnat-feed.js` | Foreløbigt snapshot, ikke certificeret |
| 2026 modelresultater | `../modelevaluering-trin1*.md`, `../modelevaluering-trin2.md` | Retrospektive rekonstruktioner |
| Historiske prognoseholdouts | `../../analyser/heldout_predictions.csv`, `../../analyser/heldout_factors.csv`, `../../analyser/summary.csv` | Beregnede historiske tests, **ikke rå målinger** |
| Historiske testfiler | `../../tests/data/historical-*.csv` | Prognoser, fejl og horisontkalibrering |
| Historisk kildearkiv | `../../analyser/historisk_modeltest_grundlag.zip` | ZIP-arkiv; indhold skal inventariseres før import |
| Historisk QA | `../historical-audit-2018-2022.md` | 71 valg og 565 målingsregistreringer i særskilt korttidskontrol; ikke automatisk repræsentativt for hele historikken |

## Tabeller og primærnøgler
Se `manifest.json` for skemaer, datofelter og regler. CSV-filerne indeholder indledningsvis kun kolonneoverskrifter, ikke opdigtede rækker. Data fra eksisterende filer forbliver i deres oprindelige placering, indtil valideret import kan foretages.

## Indsamlingsplan
1. **Inventar og validering:** klassificér historiske filer som rå målinger, valgresultater eller modeloutput; undersøg ZIP og dubletter; dokumentér datoer og kildegrundlag.
2. **Valg og kandidater:** hent valgresultater og kandidatidentiteter, helst MIT Election Lab og statslige valgmyndigheder; match ordinære/særlige valg særskilt.
3. **Grundprognose:** opbyg delstatslean fra tidligere valg, incumbency, tidligere kandidatresultater og national politisk kontekst.
4. **Approval og økonomi:** historisk præsidentapproval og realtidsvintager fra BLS/BEA/FRED/ALFRED; bevar udgivelsesdatoer.
5. **Kampagneøkonomi:** FEC kandidat-ID, finansrapporter, receipts, disbursements, cash on hand, independent expenditures; aldrig bruge rapporter, der først blev offentliggjort efter prognosedatoen.
6. **As-of feature snapshots:** frys hver faktors senest kendte værdi 7, 14, 28, 56 og 84 dage før valget; mål manglende data.
7. **Holdout:** sammenlign baseline, +incumbency, +approval, +økonomi, +finansiering og +målinger med leave-one-election-year-out. Rapportér MAE, bias, RMSE, Brier og intervaldækning.

## Vigtige metodiske hensyn
En stor kampagnekasse kan være resultatet af forventet succes snarere end årsagen til succes. Sammenlign derfor økonomiske variable både alene og efter kontrol for målinger, delstatslean og incumbency. Overvej logforholdet mellem D/I- og R-udgifter. Hold FEC-uafhængige udgifter adskilt fra kandidatudgifter. Huseffekter og national korreleret usikkerhed skal estimeres på historiske holdout-data.

## Status
- Skema og katalog oprettet.
- Eksisterende filer fundet, men endnu ikke fuldt migreret eller kvalitetssikret.
- Ingen eksterne data er påstået hentet eller verificeret.
- Ingen ændringer i hjemmesidens aktive prognose.
