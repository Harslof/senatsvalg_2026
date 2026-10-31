# Genanvendelige modeltests og datagrundlag

Dette bibliotek rummer både **frosne regressionstests for 2026-modellen** og **tidligere historiske testresultater**. De to typer må **ikke** forveksles. De frosne 2026-tal er kendte softwareoutput, ikke observationer fra et afholdt valg.

## 1. Komplette, genskabelige regressionstests (2026)

- `data/polls-2026-snapshot.json`: Frossen kopi af `MODEL.states` fra `senatsvalg/data/polls.js` (35 valg og 458 målinger). Indeholder kildefilens Git-blob-SHA, så senere dataopdateringer ikke ændrer testgrundlaget.
- `data/expected-forecast-results.json`: Forventet margin, trend, acceleration, huseffektkorrektion, fremskrivning, usikkerhed og vinderchance for hvert af de 35 valg. Indeholder også hele den nationale mandatfordeling.
- De fire testkombinationer er: oprindelig/forsøgsmodel × lige/tidsvægtning (4 ugers halveringstid).
- `model-parity.test.js`: Sammenligner aktuelle kodeberegninger med de frosne forventninger og kontrollerer, at hjemmesidens fremskrivning og sandsynlighedsmodellens fremskrivning stemmer overens.

**Kør testen fra repo-roden:**

```bash
node senatsvalg/tests/model-parity.test.js
```

Ved bevidste algoritmeændringer skal testen **først fejle**. Nye forventningsdata må først gemmes efter særskilt gennemgang af den ændrede metode; ellers risikerer vi blot at godkende nye fejl.

## 2. Historiske testresultater (1998–2022)

- `data/historical-heldout-factors.csv`: De 90 rapporterede *leave-one-election-year-out*-kalibreringsfaktorer fra en tidligere historisk analyse.
- `data/historical-heldout-predictions-FIRST-882-ROWS.csv`: **KUN ET UDDRAG** af historiske prognoseobservationer. 882 poster er bevaret fra den tidligere `heldout_predictions.csv`. Den originale CSV indeholder **1.938 poster** og er **ikke fuldt kopieret** ind i GitHub. Uddraget må ikke benyttes til at beregne den fulde analyses samlede nøgletal eller som repræsentativt testgrundlag.
- `data/historical-horizon-calibration-report.md`: Den tidligere horisontkalibreringsrapport med metode og konklusioner.
- `data/historical-election-error-notes.md`: Den tidligere analyse af national og lokal historisk valgfejl.

**Originalarkiv uden for GitHub:** `historisk_modeltest_grundlag.zip` (228.843 byte) eksisterer fortsat i brugerens ChatGPT-filbibliotek. Det indeholder `run.py`, `report.py`, `rapport.md`, `forecasts.csv` (5.814 prognoser), `summary.csv` og `bootstrap.csv`. Også originale `heldout_predictions.csv` (1.938 rækker) og `heldout_factors.csv` (90 rækker) er i filbiblioteket. Disse originale filer er endnu **ikke alle overført til GitHub**. De historiske analyser henviser desuden til FiveThirtyEight-rådata; disse er endnu ikke samlet i dette repo.

Det er vigtigt, at dette ikke fremstilles som en komplet, reproducerbar historisk backtest, før de fulde inputs, programscripts og metadata er tilføjet.

## 3. Næste trin i modeludviklingen

1. Overfør eller genskab de **komplette** historiske inputfiler og Python-scripts, med kildeangivelse, valgresultater, målingsdatoer og historiske valgår.
2. Byg en ægte **walk-forward / leave-one-election-year-out** sammenligning af den oprindelige og forsøgsmodellen. Test både fremskrivningsfejl og sandsynlighedskalibrering 7, 14 og 28 dage før valget.
3. Afprøv *huseffekter* og *aftagende trend* hver for sig før kombinationen, så effekten kan tilskrives den enkelte faktor.
4. Tilføj derefter historiske data om **genopstilling/åbne sæder** og **præsidentens approval rating** og test marginal prognoseværdi, så samme information ikke tælles dobbelt.
5. Estimér til sidst **national, regional og lokal valgfejl** ud fra de historiske residualer; test den samlede mandatfordeling. Skift ikke standardmodel før historisk test dokumenterer en forbedring.

**Fortolkning:** Præsentationens og hovedhjemmesidens ensartede tal viser teknisk konsistens, ikke empirisk dokumentation for, at den nye prognose er mere præcis.
