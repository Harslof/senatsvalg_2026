# Historisk webkontrol af uoverensstemmelser (2026-11-07)

Grundlag: `historical_poll_election_matches.csv` (403 målte valg; 348 tæt match, 7 små forskelle, 14 store, 34 uden entydigt match). Eksterne kilder er kun brugt til specifikke verificeringer nedenfor.

## Bekræftet årsag: Georgia 2008
- `2008_Sen-G_GA`: 538-reference D−R = -2,923503 pp, MIT-staging = -14,879165 pp.
- November 4 var første valgrunde, December 2 var runoff. MIT-staging med `stage=GEN` indeholder runoffresultatet, mens FiveThirtyEight `Sen-G` henviser til novembervalget.
- Georgias officielle runoffresultat: Jim Martin 909.923, Saxby Chambliss 1.228.033, margin -14,879 pp.
- Handling: genindlæs MIT-råfil med både `stage=PRE`, `stage=GEN` og `stage=RUNOFF`; map 538 `Sen-G` til novembervalget og `Sen-R` til decembervalget. **Ingen imputering**.
- Kilder: https://sos.ga.gov/page/georgia-election-results og https://sos.ga.gov/sites/default/files/2022-01/december_2008_generalelectionrunoff_totals.pdf

## Bekræftet MIT-resultat: New Jersey 2006
- `2006_Sen-G_NJ`: 538-reference +16,018946 pp, MIT +9,024964 pp.
- FEC opgiver Menendez 1.200.843 og Kean 997.775 af 2.250.070 stemmer = +9,024964 pp.
- Handling: brug MIT/FEC som facit; flag FiveThirtyEight `margin_actual` som uoverensstemmende, undersøg eventuelt dataversion/race. Ikke sikkert hvad der skabte 538-fejlen.
- Kilde: https://www.fec.gov/documents/1641/federalelections2006.pdf

## Delvis forklaret: New York 2016
- `2016_Sen-G_NY`: 538-reference +41,973248 pp, oprindelig MIT-udregning +39,230879 pp.
- MIT-staging har flere partilinjer for både Schumer og Long. Samlet på kandidatnavn bliver Schumer 5.221.949, Long 2.009.353, dvs. +41,183300 pp ud fra MIT-totalen 7.800.725.
- Det reducerer forskellen fra ca. 2,74 til 0,79 pp, men **løser den ikke fuldt ud**. Nævneren/blanke stemmer og eventuelle øvrige linjer skal kontrolleres mod officielle kilder.
- Metode: sum alle kandidatens partilinjer, brug korrekt total gyldige stemmer.
- Datadefinitioner: https://electiondata.dev/datasets/senate-results/

## Åbne problemer
- 34 uden entydigt match kræver mapping af `Sen-GS` (special), `Sen-R` (runoff), `Sen-SR` (special runoff), `stage=PRE/GEN/RUNOFF`, år 2020 vs. 2021, og særskilte races i samme delstat/år.
- 7 små og de øvrige store afvigelser kræver gennemgang af fusion voting, blanke stemmer, kandidatnavne og kildeversioner.
- Korrigér ikke den primære `elections.csv` eller produktionsprognosen før alle transformationer er reproducerbare og kildeangivne.
