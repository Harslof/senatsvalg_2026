# Historiske råkilder – reproducerbar staging

Disse filer er arkiveret separat fra produktionshjemmesiden. **Margin, lineær og acceleration på den offentlige hjemmeside må ikke ændres.**

## Kilder
| Kilde | Filer | Indhold | Status |
|---|---|---|---|
| MIT Election Lab | `mit_senate_1976_2024.csv` | Kandidatstemmer til senatsvalg 1976–2024 | Arkiveret i GitHub |
| FiveThirtyEight – råmålinger | `538_raw_polls_1998_2022.part01.csv.txt` … `part05.csv.txt` | 20.466 målingsrækker + header; alle valgtyper i brugerens råfil, ikke kun Sen-G | Arkiveret i GitHub |
| FiveThirtyEight – ældre råudtræk | `538_raw_polls_legacy.part01.csv.txt` … `part03.csv.txt` | 11.475 målingsrækker + header | Arkiveret i GitHub |
| FEC officielle resultater | Brugerens Excel-filer 2000–2022 | Valgresultater, valgrunder og partilinjer | **Ikke uploadet til GitHub endnu** |
| FEC-afstemning | `../staging/historical_reconciliation_57.csv.gz.b64` | Foreløbig audit af 57 problematiske valg | Arkiveret, **45 endnu ikke verificeret** |
| Præsidentens approval | `../approval/presidential_approval_2025_2026.csv` | 1.113 målinger | Arkiveret |

## Saml råmålingerne igen
Part-filerne er fortløbende tekststykker af én CSV uden gentagne headerrækker. De er navngivet `.csv.txt` for at gøre det tydeligt, at de ikke er selvstændige CSV-filer med header.

```python
from pathlib import Path
root = Path("senatsvalg/data/forecast-db/raw")
for stem, dest in [
    ("538_raw_polls_1998_2022", "538_raw_polls_1998_2022.csv"),
    ("538_raw_polls_legacy", "538_raw_polls_legacy.csv"),
]:
    parts = sorted(root.glob(stem + ".part*.csv.txt"))
    assert len(parts) == (5 if "1998_2022" in stem else 3), (stem, len(parts))
    with (root / dest).open("w", encoding="utf-8", newline="") as out:
        for part in parts:
            out.write(part.read_text(encoding="utf-8"))
```

**Bemærk:** Arkiveringen normaliserer tekstlinjeskift til LF. Råfilerne er derfor tekstmæssigt gengivet, men ikke nødvendigvis byte-identiske med de oprindelige uploads.

## Kildekontrol og næste trin
- FEC-råregnearkene og de fulde, afledte `historical_polls_538`, `historical_candidate_results`, `historical_rounds_v2`, `historical_race_mapping` og `historical_verification` er **ikke alle lagt i GitHub**. Arkivet er derfor **endnu ikke en færdig, fuldt reproducerbar historisk database**.
- De 57 afvigende valg er ikke automatisk rettet. Afvent FEC-verifikation før brug som endeligt facit.
- 2025–2026 approval må ikke bruges som historisk approval-data til tidligere valg.
