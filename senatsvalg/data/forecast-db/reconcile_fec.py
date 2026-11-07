#!/usr/bin/env python3
"""Conservative reconciliation of historical FEC extracts with FiveThirtyEight/MIT audit.
Usage: python reconcile_fec.py --audit historical_audit_49.csv --fec fec_verified_2002_2022.csv --preliminary fec_new_preliminary_matches.csv --out historical_reconciliation_57.csv
Does NOT modify website forecast models.
"""
import argparse,csv
def read(p):
 with open(p,encoding="utf-8-sig",newline="") as f:return list(csv.DictReader(f))
def num(v):
 try:return float(v)
 except (ValueError,TypeError):return None
p=argparse.ArgumentParser()
for arg in ("audit","fec","preliminary","out"):p.add_argument("--"+arg,required=True)
a=p.parse_args();audit=read(a.audit);verified=read(a.fec);pre=read(a.preliminary)
lookup={r["race"]:(num(r["fec_margin_pp"]),r["source"],r["fec_dem_votes"],r["fec_rep_votes"],r["fec_total_votes"]) for r in verified}
# Only simple race-level candidate rows have been crosschecked; fusion/summary rows excluded.
for r in pre:
 if r["race"] in ("2012_Sen-G_HI","2012_Sen-G_ME"):
  lookup[r["race"]]=(num(r["fec_margin_candidate_rows"]),r["fec_source"],"","","")
rows=[]
for r in audit:
 race=r["race"];fec=lookup.get(race);ref=num(r["reference_margin"]);mit=num(r["mit_margin"])
 margin=fec[0] if fec else None;diff=(margin-ref) if margin is not None and ref is not None else None
 status=("PENDING_FEC_EXTRACTION" if fec is None else "FEC_MATCHES_538" if abs(diff)<=0.02 else "FEC_DIFFERS_FROM_538")
 rows.append(dict(race=race,year=r["year"],state=r["state"],initial_category=r["category"],reference_margin_pp=ref,mit_margin_pp=mit,fec_margin_pp=margin,fec_minus_reference_pp=diff,fec_dem_votes=fec[2] if fec else "",fec_rep_votes=fec[3] if fec else "",fec_total_votes=fec[4] if fec else "",source=fec[1] if fec else "",status=status))
with open(a.out,"w",encoding="utf-8",newline="") as f:
 w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
print("Audited",len(rows),"FEC compared",sum(x["fec_margin_pp"] is not None for x in rows))
