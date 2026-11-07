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
Se `manifest.json` for skemaer, datofelter og regler. De fleste faktortabeller indeholder fortsat kun kolonneoverskrifter. `polls.csv` er nu importeret fra eksisterende 2026-data; historiske resultater er placeret i særskilt staging indtil uafhængig kontrol. Data fra eksisterende filer forbliver i deres oprindelige placering, indtil valideret import kan foretages.

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

## Fase 2 – faktisk udført 7. november 2026
- **379** eksisterende målingsrækker fra `../polls-export.json` importeret til `polls.csv`. Feltperioder, målingsmargin, institut og eventuelt angivne D/R-procenter er bevaret. Ukendt offentliggørelsesdato og stikprøvestørrelse står tomme. `additional_poll_rounds` er **ikke** importeret som selvstændige målinger.
- **357** unikke historiske valghændelser (1998–2022) identificeret i `../../analyser/heldout_predictions.csv`. Deres reference-marginer er udskilt i `historical_results_staging.csv`, med tydelig status `backtest_reference_not_independently_verified`. De er **ikke** lagt i `elections.csv` som certificerede valgresultater.
- Intern kontrol: ingen indbyrdes modstridende `actual`-marginer for samme valghændelse på tværs af de eksisterende modeltest-rækker.
- ZIP-arkivet med historiske grundlagsdata er identificeret, men **ikke åbnet** via den tilgængelige GitHub-forbindelse. Derfor er historiske råmålinger, stemmetal og kandidatnavne endnu ikke importeret.
- **Vigtigt:** `election_id` for 2026 er foreløbig en teknisk importnøgle; specialvalg og uafhængige kandidater kræver endelig race-mapping før modellering.

### Næste fase-2 kontrol
1. Udpak og dokumentér historisk ZIP-indhold, og sammenhold med råfiler og tidligere valgaudits.
2. Verificér de 357 staging-marginer mod officielle/MIT-resultater, inkl. tredjepartskandidater og specialvalg.
3. Importér verificerede resultater og kandidat-ID'er til `elections.csv` og `candidates.csv`.
4. Indfør verificerede offentliggørelsesdatoer, så historiske målinger kan bruges i *as-of*-tests.

## Fase 2 – gennemgang af brugerens historiske ZIP-udtræk (7. november 2026)
Brugeren har fremsendt `forecasts.csv`, `summary(1).csv`, `bootstrap.csv`, `run.py`, `report.py` og `rapport.md` fra arkivet. De er analyseret separat; ingen dubletter er importeret til de primære datatabeller.

- `forecasts.csv`: 5.814 model/scenarie-rækker (ikke 5.814 uafhængige valg). Kolonner omfatter år, race, model, horisont, prognose, faktisk margin, fejl, sigma og dækningsindikatorer.
- `summary(1).csv`: 18 aggregerede scenarier; `bootstrap.csv`: 18 bootstrapintervaller.
- `run.py` afhænger eksplicit af `/mnt/data/raw_polls.csv`, som **ikke** fulgte med de seks filer. Scriptet kræver desuden pandas, numpy og scipy.
- `rapport.md` beskriver FiveThirtyEight raw_polls.csv (2024-version), 1998–2022, ordinære Sen-G med DEM/REP som førende kandidater og særlige valg. En historisk rekonstruktion er ikke en identisk genkørsel af webmodellen.
- De fremsendte filer kan bruges til validering af historiske *modeloutputs*, men de dokumenterer ikke alle de underliggende råmålinger, stemmetal, kandidatidentiteter eller kilde-/publiceringsdatoer. **Undlad at behandle dem som en råmålingdatabase.**

**Næste nødvendige input:** råfilen `raw_polls.csv` (eller den oprindelige kilde med dokumenterede felter). Derudover valgresultater fra MIT Election Lab eller statslige valgmyndigheder til uafhængig verifikation.

## Fase 2 – rådata gennemgået, importscript tilføjet (7. november 2026)
Brugeren har også leveret `raw_polls (1).csv` (FiveThirtyEight, 2024-schema) og `1976-2024-senate-state.csv` (MIT Election Data and Science Lab). En lokal, reproducerbar staging-kørsel gav:
- 4.923 DEM/REP Sen-G målingsrækker, 403 unikke målte valg, efter deduplikering på race/poll_id/question_id (15 valgår 1998–2022, inklusive særvalg).
- 2.455 kandidatresultatrækker fra MIT-data efter filtrering på general election, total mode og år >=1998.
- 444 valg med præcis én D- og én R-kandidatrække og konsistent total; 40 valghændelser sat i undtagelseslisten.
- 369 identiske valg-ID'er i både målings- og valgresultat-staging; resterende kræver race-ID-/specialvalg-kontrol.
- Filerne `historical_polls_538.csv`, `historical_candidate_results.csv`, `historical_elections_staging.csv`, `historical_exceptions.csv` er genereret som lokale staging-artifakter, **ikke** automatisk tilføjet til GitHub.
- `import_historical.py` er lagt på GitHub og kan reproducere staging fra de to kildefiler. Råfilerne er ikke uploadet til repoet. De eksisterende `elections.csv` og `candidates.csv` er ikke ændret.
- Vigtigt: FiveThirtyEight `polldate` er median-feltdato, ikke dokumenteret offentliggørelsesdato. MIT-aggregater er ikke uafhængigt verificeret mod officielle statskilder. Kvalitetskontrol og matchning af særvalg er næste trin.

## Fase 2 – første match mellem historiske målinger og valgresultater
Sammenkædning på `election_id` af 403 unikke målingsvalg og 444 entydige MIT-resultater i staging:
- 348 matcher med absolut forskel i D−R-margin <=0,02 procentpoint.
- 7 har forskel >0,02 og <=0,25 pp.
- 14 har forskel >0,25 pp.
- 34 har ikke et entydigt `election_id`-match.
- 75 af de 444 MIT-valg har ingen direkte målingsrække med samme ID.
- 8 af de 40 undtagelsesvalg har målinger og kræver særskilt behandling.

**OBS:** Et marginmatch er en intern krydskontrol af to datasæt, ikke uafhængig officiel verifikation. Første match er på tekst-ID, så specialvalg (`Sen-GS`), omvalg/runoffs (`Sen-R`, `Sen-SR`) og valgårsvariationer kræver race-mapping før de kan betegnes som manglende. Undersøg særligt 2006 NJ (+6,99 pp) og 2008 GA (+11,96 pp); mulige race-/valgdefinitionsproblemer. Der er ikke foretaget ændringer af produktionsmodellen.
