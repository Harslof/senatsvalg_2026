# Kontrol af resterende historiske valg (7. november 2026)

## Omfang
Udgangspunkt: lokal `historical_matches_v2.csv`, 403 valg i FiveThirtyEight; 346 marginmatch inden for 0,02 pp, 8 små afvigelser (0,02–0,25 pp), 28 større afvigelser (>0,25 pp), 21 uden entydigt match. I alt **57 rækker til videre kontrol**; de 49 er de 28 store og 21 umatchede.

Automatisk gennemgang af MIT-råfilens `stage`, `special`, kandidatnavne, partibetegnelser, stemmetal og valgrundetyper giver følgende **diagnostiske hypoteser, ikke endeligt verificerede årsager**:

### 21 uden match
- 14: flere samme-parti-kandidater, indskrivningsstemmer eller sammenblandede valgrunder. Kræver eksakt kandidatmatch og valgrundekontrol.
- 5: ingen MIT-rækker for delstat/år: `2010_Sen-GS_MA`, `2013_Sen-GS_MA`, `2013_Sen-GS_NJ`, `2017_Sen-GS_AL`, `2022_Sen-G_CT`.
- 1: særvalgsflag afviger: `2010_Sen-G_IL` (MIT special=True).
- 1: ingen D/R-partikoder i MIT: `2020_Sen-G_WY` (kandidater står som OTHER).

### 36 afvigelser
- 28 >0,25 pp og 8 mellem 0,02–0,25 pp.
- 16 af de 36 har mere end én D/R-partilinje i den foreløbige sammenkædning og bør kontrolleres for fusion voting. Dette er **ikke bevis** for at forskellen skyldes fusion.
- Den tidligere verificering af `2006_Sen-G_NJ` mod FEC taler for MIT-marginen, men de øvrige er ikke kildeverificeret enkeltvis.

### Kritisk metodefund
`stage=gen` i MIT kan indeholde stemmer fra flere valgrunder i samme delstat/år; en automatisk konvertering fra `Sen-R` til `GEN` er ikke tilstrækkelig. For Louisiana 2002 ses eksempelvis to stemmerækker for Landrieu og Terrell med samme navn og totalvotes, hvilket kræver eksplicit valg-/rundeseparation. Også Georgia 2020 kræver separate ordinære og særlige omvalg. **Undlad at aggregere disse til én kandidatsum på tværs af valgrunder.**

## Kontrolbeslutning
Der er endnu **ikke** dokumentation til at markere de 49 som officielt verificerede. Brug foreløbigt status `PENDING_OFFICIAL_CHECK`; bevar rådata, og ændr ikke produktionsmodel eller historisk facit.

## Officielle kilder til næste verifikation
- FEC, Federal Elections 1998–2022: https://www.fec.gov/introduction-campaign-finance/election-results-and-voting-information/
- House Clerk, Historical Election Statistics: https://history.house.gov/Institution/Election-Statistics/Election-Statistics/
- MIT Election Lab: https://electiondata.dev/datasets/senate-results/

Lokal fuld diagnostisk tabel: `historical_audit_49.csv` (57 rækker; endnu ikke indlæst i GitHub).
