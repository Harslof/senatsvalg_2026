# FEC-krydskontrol: 2002 og 2022 (7. november 2026)

Brugerupload: `FederalElections2002_Senate.xlsx`, `federalelections2022.xlsx` samt tilsvarende FEC-PDF'er. Kilderne er FEC's officielle publikationer, baseret på delstaternes indberetninger.

Kontrolleret mod 57 problematiske FiveThirtyEight/MIT-valg: 9 i 2022 og 1 i 2002 (Louisiana runoff). Kildekolonne og detaljer findes i lokalt `fec_verified_2002_2022.csv`; CSV er ikke endnu uploadet til repo.

| Race | FEC D−R pp | 538 D−R pp | Vurdering |
|---|---:|---:|---|
| 2002_Sen-R_LA | +3.400966 | +3.400966 | Eksakt; FEC har separat runoff-stemmetal |
| 2022_Sen-G_IA | -12.178645 | -12.178645 | Eksakt |
| 2022_Sen-G_NH | +9.156407 | +9.060751 | Afvigelse 0,095656 pp; MIT/FEC matcher |
| 2022_Sen-G_VT | +40.441310 | +40.441310 | Eksakt |
| 2022_Sen-G_NY | +14.000530 | +13.981957 | Afvigelse 0,018573 pp; fusion voting |
| 2022_Sen-G_MO | -13.255426 | -13.255426 | Eksakt |
| 2022_Sen-G_AZ | +4.887427 | +4.887427 | Eksakt |
| 2022_Sen-G_CT | +14.915703 | +13.114827 | 538-margin ser ud til at udelade Working Families-stemmer for Blumenthal (22.689) |
| 2022_Sen-G_IL | +15.323175 | +15.323175 | Eksakt |
| 2022_Sen-G_MD | +31.693182 | +31.693182 | Eksakt |

**Definition:** FEC-margin beregnet som 100*(samlede D-kandidatstemmer - samlede R-kandidatstemmer)/alle gyldige stemmer i netop det pågældende valg. I New York medregnes Schumers Working Families og Pinions Conservative stemmer. I Connecticut medregnes Blumenthals Working Families-stemmer.

**Status:** 7 af 10 matcher FiveThirtyEight til numerisk præcision; 3 kræver håndtering af forskel (NH, NY, CT). At 538 stemmer med FEC betyder ikke nødvendigvis, at MIT importen er rettet. Kontrollér kandidat-ID og kilder før træning. 2002 Louisiana er særskilt runoff og må ikke blandes med novemberresultatet. Øvrige årgange er ikke dækket af brugerens seneste FEC-filer.

Ingen produktionsdata er ændret.
