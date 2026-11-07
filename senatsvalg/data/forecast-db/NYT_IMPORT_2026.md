# Import af brugerleveret NYT Senate-polludtræk – 7. november 2026

## Kilder og reproducerbarhed
- Originalt tekstudtræk fra brugeren er bevaret **uændret i rækkefølge og indhold** i `raw/nyt_senate_polls_2026_text.txt` (1.421 opslag i udtrækket).
- `nyt_import_audit_2026.csv` indeholder en struktureret række pr. opslag samt dets beslutning i kolonnen `import_status`, med oprindeligt linjenummer `source_line` til kontrol mod råteksten. Udtrækket er tekst fra en weboversigt – det indeholder ikke entydige NYT-poll-ID'er eller publiceringsdatoer.
- `polls.csv` er udvidet fra **379 til 588** rækker: **209** nye, entydigt matchede målinger fra 2025–2026 for de eksisterende 2026-senatsvalg.
- **305** af de 1.421 opslag matchede allerede eksisterende målinger ud fra delstat, institut, feltperiode og margin (med navnealiaser). Ingen af dem er tilføjet igen.
- **907** opslag er foreløbigt uden for det aktive forecast-db-udvalg, herunder primærvalg, særskilte ranked-choice-runder, alternative spørgsmål, valgår uden for 2025–2026, andre kandidatopstillinger og uafhængige kandidatkonkurrencer. Udelukkelsesgrunde kan overlappe: se `import_status` på hvert opslag.
- **80** af de 209 importerede målinger har feltperiode, der slutter 27. oktober 2026 eller senere.

## Principper for målingsmargin og dubletter
- Primært måltal er den **rapporterede** +margin med fortegn D–R, hvor vinderen entydigt kan identificeres fra kandidatlisten; ellers afledt margin fra D- og R-procenter.
- `dem_pct` og `rep_pct` er bevaret separat. NYT's rapporterede margin kan afvige 1 point fra forskellen på de viste afrundede procenter.
- Samme institut + samme feltperiode + samme delstat tælles kun én gang i modeldata. Alternative spørgsmål findes stadig i auditfilen.
- En D–R-måling importeres kun, hvis kandidaterne matcher det eksisterende series-par for delstaten; andre kandidatkombinationer bevares til senere manuel vurdering.
- Alaska ranked-choice varianter, Montana/Idaho/Nebraska/South Dakota med uafhængige kandidater m.v. må **ikke** fejlagtigt konverteres til D–R. Disse fremgår af audit, men ikke nødvendigvis som en aktiv tilføjelse.

## Vigtige forbehold
1. Dette er en første konservativ maskinel import, **ikke** en uafhængig kildeverifikation. Auditen skal gennemgås før modellen genkalibreres.
2. `publication_date` er fortsat blank: feltperiodens slutdato er **ikke** bevis på, at målingen allerede var offentliggjort på den dato.
3. Kandidatandele i webteksten kan være afrundede, og visse viste marginer divergerer; ved konflikter over 2 procentpoint er opslaget sendt til manuel gennemgang.
4. `polls.csv` er nu udvidet, men den **aktive hjemmeside** (`polls.js` og de afledte modelstatistikker) er **ikke ændret**, så der ikke utilsigtet ændres ved den eksisterende prognose efter valget.
5. 2025–2026-målinger udvider materialet for netop 2026-valget. De erstatter **ikke** de historiske råmålinger for 1998–2022 og løser ikke automatisk manglen på 12/8-ugers historisk datadækning.

## Næste trin
- Gennemgå auditfilens `candidate_pair_differs_from_active_race`, `same_survey_alternative_question` og `margin_conflict_gt_2pp`.
- Fastsæt en stabil race-ID-nøgle og kilde-/publiceringsdato pr. måling.
- Afklar, om de 2026-historiske målinger skal anvendes i 2026-evalueringen, men frys dataversioner ved historiske prognosedatoer for at undgå fremtidslækage.
- Opdater først eventuelt `polls.js` og regenerér margin/trend/acceleration med samme modelkode som hjemmesiden allerede anvender, når importreglerne er godkendt.
