# Valgnatten 2026 – Black Edition (visningsside)

Åbn `senatsvalg/valgnat.html`. Siden er ikke linket fra navigationen og har `noindex,nofollow`, men er **ikke** adgangsbeskyttet: en person med URL'en kan se den, hvis den er publiceret.

## Hvad der er ændret

- Siden er **kun til visning**. Hele afsnittet »Opdater dashboardet« er fjernet: ingen formularer, sliders, import/eksport, snapshotknapper eller `localStorage`-redigering.
- »Kampen om Senatet« viser **Opdateret margin** øverst og **Exitpoll som signal** nedenunder. »Margin før valgnatten« er fjernet som separat mandatbar, men den oprindelige margin findes fortsat i delstatsgrafen og detaljekortet.
- »Fra målinger til exitpolls« viser alle 35 valg på en vandret X-akse og en lodret marginakse. Mandatgrænserne **51, 60 og 67** er forklaret i et **særskilt mandatpanel** – de er ikke fejlagtigt placeret på procentpointaksen.
- Nyt originalt mørkt, redaktionelt design med farver fra det vedlagte regnvejrsbillede: midnatsblå, regnblå, rust-rød, varm elfenben og gyldne detaljer. Layoutet er responsivt.

## Sådan opdateres valgnatsdata bagfra

1. Redigér **`senatsvalg/data/valgnat-feed.js`** i projektets filer, ikke i den offentlige visningsside.
2. Angiv exitpolls i `exits` med delstatens fulde engelske navn, margin, kilde og dansk klokkeslæt:

   ```js
   exits: {
     "Ohio": { margin: 2, source: "Verificeret kilde", time: "2026-11-04T01:45" }
   }
   ```

   Dette er **kun et format-eksempel, ikke et faktisk exitpoll-resultat**. En positiv margin betyder D/I-føring, en negativ betyder R-føring. Brug kun kandidatopdelte exitpolls; nationale vælgerprofilundersøgelser kan ikke omsættes direkte til kandidatmargin.
3. Sæt `updatedAt` til den faktiske opdateringstid, fx `"4. november kl. 07.05"`. Standardvægten er 50 %, men kan ændres i **filen** via `weight: 50`. Det er en modelantagelse, ikke en kalibreret prognose.
4. Publicér den opdaterede fil. Besøgende kan ikke ændre data; de ser de nye tal, når deres browser indlæser den opdaterede fil. En browser kan cache gamle filer; opsæt passende cachepolitik/versionering ved publicering.

### Fastfrysning af marginerne fra kl. 23

Hvis `snapshot` er `null`, bruges de **aktuelle** marginer fra `data/polls.js`, så dashboardet følger nye målingsopdateringer. Hvis kl. 23-grundlaget skal forblive uændret gennem natten, indsæt et **komplet snapshot for alle 35 delstater** i `snapshot` i `valgnat-feed.js`, med posterne `{state, inc, margin, count}`. En komplet, valideret kopi af den eksisterende 35-delstatsmodel kan genereres fra `MODEL.states` ved at tage gennemsnittet af hver delstats `points[].y`, eller bruges fra tidligere arkiverede snapshots. Et delvist eller ugyldigt snapshot ignoreres.

### Metode

- Oprindelig margin = simpelt gennemsnit af `points[].y` for hver delstat i `polls.js` (den eksisterende valgnatsmetode).
- Opdateret margin = `(1 - weight/100) × oprindelig margin + (weight/100) × exitpoll-margin`. Uden oprindelig margin bruges exitpollen alene. Uden exitpoll bruges den oprindelige margin.
- »Exitpoll som signal« bruger exitpoll-marginen i delstater med exitpoll og oprindelig margin i resten.
- Mandatfordelingen er **mekanisk**: 65 mandater uden valg fastholdes; de 35 valg fordeles efter marginens fortegn, ellers det siddende parti. Dette er ikke en sandsynlighedsmodel eller officielle valgresultater.
- De viste mandatgrænser er institutionelle tærskler: 51 til et flertal (med nuværende vicepræsidentforhold), 60 til cloture i de fleste almindelige sager, 67 som to tredjedele af 100 senatorer.
- Exitpolls er tomme i denne leverance. Ingen exitpolls eller valgresultater er opfundet.

## Tidslinje

Alle tider er dansk CET. Tidslinjen viser forventede valgstedslukninger, **ikke bekræftede exitpoll-publiceringer**. Verificér tiderne inden valgaftenen, især i delstater med flere tidszoner.
