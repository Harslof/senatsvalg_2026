# Historisk datakontrol — 2018, 2020 og 2022

## Formål
Kontrollere om brugerens historiske målinger og MIT-valgresultater kan understøtte en *as-of*-sikker, parret rolling-origin-test af uændret margin, aftagende trend, lineær trend og acceleration. Ingen ændringer af den offentlige prognose.

## Kilder
- Brugerupload: `raw-polls(1).csv` (FiveThirtyEight pollster-rådata).
- Brugerupload: `1976-2024-senate-state.csv` (MIT Election Data and Science Lab).
- Brugerupload: `codebook-us-senate-1976–2024.md`.

## Rensning og match
- Kun 2018, 2020 og 2022, ordinære senatsvalg (`Sen-G`), med demokratiske og republikanske kandidater.
- Gyldige datoer og målingsmarginer; dubletter efter poll-ID, spørgsmål-ID og valghændelse fjernes.
- Valgresultater fra MIT: `GEN`, ikke specialvalg, `TOTAL`, D−R-stemmer divideret med alle stemmer.
- Forskelle på mere end 1,5 procentpoint mellem 538s registrerede resultat og MIT-resultatet udelukkes til manuel kontrol.
- Fire udeladte valghændelser: CT 2018 (resultatforskel); WY 2020, CT 2022 og IL 2022 (manglende egnet MIT-match).

## Resultat af datakontrollen
- 71 matchede valghændelser (23 i 2018, 25 i 2020 og 23 i 2022).
- 565 tilhørende meningsmålingsregistreringer (166, 207 og 192).
- Median spændvidde mellem første og sidste målingsdato pr. valg: **12 dage**; maksimal spændvidde **20 dage**.
- **0 af 71 valghændelser** har de mindst 28 dages målingsspænd, som den eksisterende lineære/kvadratiske regression kræver.
- Ved den eksisterende modeldefinition og 2 dages antaget offentliggørelsesforsinkelse giver en fælles test på 1, 2, 4, 8 og 12 uger før valgdagen **0 gyldige prognose–valgpar**.

## Metodiske forbehold
`polldate` er én målingsdato og er ikke verificeret som enten feltperiodens slutdato eller offentliggørelsesdato. Den må ikke præsenteres som en verificeret publiceringsdato. Rådata omfatter flere spørgsmål for samme institut; de er ikke nødvendigvis uafhængige målinger. Særlige valg, runoff, ranked-choice og uafhængige kandidater kræver separat håndtering. Forskelle i kandidat- og partilinjer bør gennemgås før bredere integration.

## Beslutning
Den eksisterende historiske testmotor bevares, men der offentliggøres ingen modelrangering fra disse filer. For at gennemføre en valid test kræves længere historiske målingsserier med verificerbare datoer. Alternativt kan en **separat korttidstest** for baseline og modeller uden fire ugers datakrav udvikles, tydeligt adskilt fra den oprindelige test.

Datakontrollen blev gennemført på de brugeruploadede filer 1. november 2026.