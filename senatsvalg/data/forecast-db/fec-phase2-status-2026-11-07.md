# Fase 2 – FEC-verifikation og historisk database (2026-11-07)

**Vigtigt:** Eksisterende offentlige modeller **margin, lineær og acceleration er låst** og må ikke ændres. Nye modeller udvikles separat i modelværkstedet og aktiveres ikke automatisk.

## Kontrolstatus
- 57 problematiske valg fra tidligere historisk audit (28 store marginforskelle, 8 små, 21 uden entydigt match).
- 12 af de 57 har på nuværende tidspunkt en udtrukket FEC-margin, som kan sammenholdes direkte med FiveThirtyEight (10 med forskel <= 0,02 pp; 2 større afvigelser).
- 45 af de 57 mangler endnu færdig FEC-udtræk og race-kontrol. At en FEC Excel-fil er uploadet er **ikke** det samme som at dens valg er verificeret.
- De 12 sammenligninger kommer fra `fec_verified_2002_2022.csv` (2002/2022) samt kontrollerede simple 2012-rækker for Hawaii og Maine. Foreløbige summer fra New York 2000/2004/2012 **må ikke** bruges som facit: fusion voting, subtotaler og summeringsrækker kan medføre dobbelttælling.
- FEC's 2022-publication forklarer, at `Combined Parties` er kandidatens samlede stemmer på tværs af partilinjer, og at under-/overstemmer ikke indgår i gyldige stemmer.

## Trin 1: metode
1. Læs kun senatsvalg, ikke præsident-/House-rækker.
2. Bevar `year,state,election_date,election_type,stage,special,candidate` som separate identitetsfelter.
3. Skeln `GENERAL`, `RUNOFF`, `SPECIAL`, samt rangordnede valg; brug **samlede kandidatstemmer én gang** og ikke både `Combined Parties` og de underliggende partilinjer.
4. Kontrollér stemmetal og nævner mod FEC og sammenlign med 538 og MIT; registrér alle uenigheder og kildeark.
5. Brug status `PENDING_FEC_EXTRACTION`, `FEC_MATCHES_538` eller `FEC_DIFFERS_FROM_538` for foreløbige sammenligninger. Status betyder **ikke** automatisk endeligt race-match.
6. Hold uafklarede rækker ude af historisk modelkalibrering.

## Trin 2: historisk datamodel
Bevar råkilder uændret og brug separate tabeller: `elections` (valghændelser), `candidates` (stemmer, fusion, partier), `polls` (målinger), `race_mapping` (538→FEC/MIT), `verification` (status, kilde, beregning, review). Fremtidige importkørsler skal være idempotente, logge kildefil og ikke overskrive godkendt facit.

## Filer
`reconcile_fec.py` kan genberegne den konservative 57-rækkers kontrol fra tidligere CSV-udtræk. De nyeste bruger-uploadede FEC Excel-ark for 2004–2022 er tilgængelige til yderligere extraction, men de 45 udestående kontroller er endnu ikke færdigbehandlet. Ingen offentlige modelberegninger er ændret.
