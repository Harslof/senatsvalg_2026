# Præsidentens approval ratings – råmålinger (2025–2026)

**Data:** `presidential_approval_2025_2026.csv` (1.113 målinger, 2025-01-19 til 2026-11-02). Afskrevet fra brugerens indsatte liste over præsidentens approval-målinger. Den oprindelige liste er ikke verificeret mod hver enkelt instituts publikation.

## Felter
- `poll_id`: stabilt hash-id fra institut, periode, sponsor og tal.
- `president`: Donald Trump.
- `pollster`, `sponsor`, `sponsor_flags`: institut, bestiller og evt. angivet partisk sponsor.
- `start_date`, `end_date`: ISO-datoer fra feltperioden.
- `approve_pct`, `disapprove_pct`: rapporterede procenter.
- `net_approval_pp`: beregnet approve minus disapprove, procentpoint (positiv = godkendelse i overtal).
- `reported_net_pp`: net approval som gengivet i kildelisten.
- `net_difference_pp`: beregnet minus rapporteret; 66 af 1.113 rækker afviger med præcis 1 procentpoint, foreneligt med afrunding eller kildens opgørelsesmetode; ingen afviger mere end 1.
- `raw_period`, `raw_result`, `source_block`: sporbarhed til indsatte kildetekst.

## Datakvalitet og modelanvendelse
Alle 1.113 blokke er importeret, og ingen datoer er omvendt. Årstal i datolinjer uden eksplicit år er udledt af listens kronologi (2025 eller 2026). Sponsor- og partiskhedsfelter er kun udfyldt, når de fremgår af kilden. Ingen stikprøvestørrelser, populationstyper, publiceringsdatoer eller originale URL'er er tilføjet, fordi de ikke findes i materialet.

Til modellering: anvend kun målinger, der var tilgængelige på prognosetidspunktet (publiceringsdato er ukendt og skal håndteres konservativt), og undgå at lade mange målinger fra samme institut dominere uden særskilt vurdering. Disse 2025–2026-tal kan bruges til nutidige nationale features, men **ikke** som historisk approval-træning for valg i 1998–2024; det kræver historiske approval-serier.

**Adskillelse:** Datasættet ligger i forecast-db/approval. Det ændrer ikke de eksisterende margin-, lineær- og accelerationsmodeller på senatsvalghjemmesiden. Nye modeller skal udvikles separat i modelværkstedet.
