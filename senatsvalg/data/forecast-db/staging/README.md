# Historiske data – staging (ikke produktion)

Dette område indeholder **foreløbige** historiske kontroller. Det ændrer ikke senatsvalghjemmesidens eksisterende **margin, lineær eller acceleration**-modeller.

## Indlagt i GitHub
- `historical_reconciliation_57.csv.gz.b64`: hele 57-rækkers kontroltabellen fra fase 2, gzip-komprimeret og base64-kodet som UTF-8 tekst. Filen kan genskabes med:
  ```python
  from pathlib import Path
  import base64,gzip
  p=Path("historical_reconciliation_57.csv.gz.b64")
  Path("historical_reconciliation_57.csv").write_bytes(gzip.decompress(base64.b64decode(p.read_text().strip())))
  ```
- `../reconcile_fec.py`: script til at gentage kontrollen med de tidligere CSV-kilder.
- `../fec-phase2-status-2026-11-07.md`: dokumentation af datastatus og modeladskillelse.

**Ikke indlagt endnu:** de store 538- og MIT-CSV-udtræk og de fulde FEC-Excel-filer. De ligger i den lokale stagingpakke og må ikke beskrives som uploadet til GitHub. Næste upload bør være kildefilerne og de reproducerbare resultat-CSV'er i læsbar form.

## Skal alle 45 kontroller gennemføres nu?
Nej, ikke før en første eksperimentel model kan udvikles. Hold 45 som `PENDING_FEC_EXTRACTION`, og hold dem ude af **verificeret** kalibrering. Man kan udvikle nye modeller med klart mærkede foreløbige historiske data og teste robusthed ved at udelade uafklarede valg. Før endelig kalibrering og publicering af performance-mål skal valgidentitet, valgrundetype, kandidater, nævner og FEC-stemmetal kontrolleres. Prioritér de valg, der indgår i backtests, de største uoverensstemmelser og tætte valg.

## Kilde- og versionsregler
- Bevar 538-, MIT- og FEC-rådata separat.
- Dokumentér kildeårgang, ark, kandidatstemmer og valgtype.
- Registrér rettelser i mapping/verification-tabeller, ikke ved at overskrive rådata.
- Ingen ændringer af `margin`, `lineær` eller `acceleration` på den offentlige hjemmeside.
