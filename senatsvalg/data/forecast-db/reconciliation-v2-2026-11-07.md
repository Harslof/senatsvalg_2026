# Fase 2: korrigeret import og anden matchkontrol

Kilder: brugerens `raw_polls (1).csv` fra FiveThirtyEight og `1976-2024-senate-state.csv` fra MIT Election Data and Science Lab. Ingen ændringer af produktion eller de verificerede hovedtabeller.

## Importrettelser
- Normalisér MIT `stage` uanset store/små bogstaver, og bevar `PRE`, `GEN`, `RUNOFF` som **forskellige valgrunder**. `GEN RUNOFF` normaliseres til `RUNOFF`.
- Bevar `special` i valgidentiteten.
- Gruppér kandidatens stemmer på tværs af partilinjer (fusion voting), og udled D/R-tilknytning på tværs af linjerne. Undlad at summere `totalvotes` på tværs af kandidatrækker.
- Ændringen er implementeret i `import_historical.py` og gælder kun staging.

## Foreløbig genmatchning
På 403 unikke FiveThirtyEight-valg, med stage- og specialvalgshåndtering i en lokal kontrolberegning:
- 346: absolut forskel <=0,02 procentpoint
- 8: forskel >0,02 og <=0,25 procentpoint
- 28: forskel >0,25 procentpoint
- 21: intet entydigt match

**Dette er ikke en fuldt verificeret facitdatabase.** Den korrigerede matchning skal stadig implementeres i et versionsstyret sammenkædningsscript; tallene er fra en lokal diagnostisk kørsel. Forskellene mellem tidligere 348/7/14/34 og de nye tal skyldes både flere korrekte stemmesummer og ændret matchdefinition, og kan ikke alene tolkes som et antal løste fejl.

## Konkrete eksempler
- Georgia 2008: `2008_Sen-R_GA` har valgdato 2008-12-02 og skal matches til **omvalget**, ikke til `PRE`. Den tidligere kontrol, som påstod at netop denne række var fejlmatchet til novembervalget, var misvisende.
- New York og Connecticut: flere kandidater optræder på flere partilinjer; saml linjerne før beregning af D−R.
- New Jersey 2006: FiveThirtyEight og MIT er stadig uenige; kontrolleret mod FEC, der støtter MIT-resultatet.
- De resterende afvigelser inkluderer `Sen-GS`, `Sen-R`, `Sen-SR`, valgår uden MIT-rækker i brugerens råfil og forskelle i kandidat-/stemmeopgørelse.

## Næste kontrol
1. Versionsstyr matchscriptet og tilføj race-ID, valgdato og kandidattjek (ikke kun år/delstat).
2. Kontrollér hver af de 28 store forskelle mod FEC/statslige arkiver.
3. Kontroller de 21 uden match for manglende år, særvalg, valgrundetype og ufuldstændige partilinjer.
4. Hold uafklarede rækker ude af træning; ingen automatiske erstatninger af facit.
Kildedokumentation: https://electiondata.dev/datasets/senate-results/ og https://doi.org/10.7910/DVN/PEJ5QU
