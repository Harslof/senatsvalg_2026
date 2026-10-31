# Historiske senatsvalg: delstatsspecifik valgusikkerhed og tre scenarier

**Datagrundlag:** Vedlagte FiveThirtyEight `raw-polls.csv` (historisk udgave), med `raw_polls.csv` som kontrol. Kun `Sen-G`, demokraten og republikaneren som de to øverste kandidater, målinger med midterdato 0–14 dage før valget, og kendt faktisk D–R-margin. Målinger aggregeres til ét uvægtet gennemsnit pr. valgår og delstat. Flere målinger i samme valg tælles således ikke som uafhængige valg.

**Hovedtal:** 2.082 målingsrækker, 349 valg i 16 valgår (inklusive særlige valg). Årets gennemsnitlige målingsfejl repræsenterer den fælles nationale komponent. Standardafvigelsen på tværs af valgår er 3,02 procentpoint (ikke en direkte kalibrering af 2026). Efter fratrækning af valgårets gennemsnitlige fejl er standardafvigelsen af den delstatsspecifikke restfejl 5,49 pp. Da denne metode bruger den testede delstat i beregningen af årsfejlen, er tallet optimistisk.

**Strengere kontrol:** For hvert valg estimeres årets fælles fejl ud fra *de øvrige delstater samme år*. Valgår med færre end tre valg udelades. Det giver 345 valg og RMSE på 5,73 pp for den resterende fejl. Denne kontrol fjerner egen-observationslækage, men ikke afhængighed mellem valg samme år.

## Følsomhedstest: 90 %-intervaller

I tabellen bruges et illustrativt udgangspunkt med en allerede eksisterende delstatsspecifik standardafvigelse på **5,0 pp**, og tillægget lægges til i kvadratur: `sigma_ny = sqrt(sigma_basis^2 + tillæg^2)`. Den fælles nationale fejl holdes adskilt og er ikke lagt oveni her. Tabellen er **ikke** en fuld genkørsel af hjemmesidens 2026-prognosemodel: den bruger historiske slutmålinger som prognoser og en fast basisusikkerhed, ikke modellens forskellige sigma-estimater for hver delstat.

| Ekstra valgusikkerhed | Samlet sigma ved 5,0 pp basis | Faktisk dækning af 90 %-interval, 345 valg |
|---|---:|---:|
| 0 pp | 5,00 pp | 86,1 % |
| 2 pp | 5,39 pp | 89,0 % |
| 3 pp | 5,83 pp | 93,3 % |

Til sammenligning: Med 3,5 pp som basis bliver dækningen 73,0 %, 77,7 % og 83,2 %; med 5,5 pp som basis bliver den 91,0 %, 93,6 % og 95,1 %. **Resultatet afhænger altså kraftigt af den usikkerhed, modellen allerede medregner.**

## Vurdering

Et tillæg på **2 pp er en plausibel følsomhedsantagelse** i det illustrerede eksempel med 5,0 pp eksisterende usikkerhed. Det er ikke et robust estimat for et universelt tillæg: Restfejlen på 5,73 pp indeholder allerede almindelig målingsfejl, forskelle mellem delstater og eventuelle sene vælgerbevægelser. Tillægget kan ikke identificeres særskilt uden at teste den *faktiske model* mod historiske valgresultater og estimere, hvilke fejlkomponenter modellen allerede indregner. Med 3 pp bliver intervallet i eksemplet for bredt, men det kan ikke generaliseres til alle delstater.

**Anbefalet næste test:** Genskab hele 2026-modellens historiske input (målingernes datoer, vægtning, regression, horisontkalibrering og nationalt korrelerede fejl) for tidligere senatsvalg. Evaluer 0, 2 og 3 pp på valgår, der holdes ude ved parameterestimering. Sammenlign 50/80/90/95 %-dækning, logscore og fejl for mandatfordelingen. Først derefter vælges et tillæg til produktionsmodellen.

**Kontrol med nyere datasæt:** `raw_polls.csv` giver 349 valg, 2.9619 pp national årsspredning og 5.4497 pp delstatsrestspredning med samme udvælgelsesprincip, tæt på den historiske udgaves tal.
