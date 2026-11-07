#!/usr/bin/env python3
"""Reproducible phase-2 staging. Run:
python3 import_historical.py /path/to/raw_polls.csv /path/to/1976-2024-senate-state.csv
Requires pandas. Never changes production model or verified core tables.
"""
import sys
from pathlib import Path
import pandas as pd
if len(sys.argv)!=3:
    raise SystemExit("Usage: python import_historical.py raw_polls.csv 1976-2024-senate-state.csv")
out=Path(__file__).resolve().parent
p=pd.read_csv(sys.argv[1],low_memory=False)
p=p[(p.type_simple=="Sen-G")&(p.cand1_party=="DEM")&(p.cand2_party=="REP")].drop_duplicates(["race","poll_id","question_id"]).copy()
p["election_id"]=p.race
p["publication_date"]=""
p["source"]="FiveThirtyEight pollster-ratings/raw_polls.csv"
cols=["election_id","poll_id","question_id","race_id","cycle","location","pollster","pollster_rating_id","methodology","partisan","polldate","publication_date","electiondate","samplesize","cand1_name","cand1_id","cand1_pct","cand2_name","cand2_id","cand2_pct","margin_poll","margin_actual","source"]
p[cols].to_csv(out/"historical_polls_538.csv",index=False)
e=pd.read_csv(sys.argv[2],low_memory=False)
e=e[(e.year>=1998)&(e["mode"].astype(str).str.upper()=="TOTAL")].copy()
e["stage_norm"]=e.stage.astype(str).str.upper().replace({"GEN RUNOFF":"RUNOFF"})
e["special"]=e.special.astype(str).str.lower().eq("true")
e["candidate_norm"]=e.candidate.fillna("").str.upper().str.replace(r"[^A-Z0-9]","",regex=True)
e["verification_status"]="MIT_dataset_unverified_against_official"
e.to_csv(out/"historical_candidate_results.csv",index=False)
records=[];exceptions=[]
for (year,state,special,stage),g in e.groupby(["year","state_po","special","stage_norm"]):
    total=g.totalvotes.dropna().unique()
    candidates=[]
    for name,h in g[g.candidate_norm.ne("")].groupby("candidate_norm"):
        parties=set(h.party_simplified.dropna().str.upper())
        party="D" if "DEMOCRAT" in parties else "R" if "REPUBLICAN" in parties else "O"
        candidates.append((party,h.candidate.iloc[0],h.candidatevotes.sum(),len(h)))
    d=[c for c in candidates if c[0]=="D"];rr=[c for c in candidates if c[0]=="R"]
    key=f"{year}_{state}_{'SPECIAL' if special else 'REGULAR'}_{stage}"
    if len(d)!=1 or len(rr)!=1 or len(total)!=1 or total[0]<=0:
        exceptions.append(dict(election_id=key,dem_candidate_rows=len(d),rep_candidate_rows=len(rr),totalvotes_variants=len(total)))
        continue
    records.append(dict(election_id=key,year=year,state=state,special=special,stage=stage,dem_candidate=d[0][1],rep_candidate=rr[0][1],dem_votes=d[0][2],rep_votes=rr[0][2],total_votes=total[0],dem_margin_pp=100*(d[0][2]-rr[0][2])/total[0],fusion_lines=d[0][3]+rr[0][3],verification_status="MIT_dataset_unverified_against_official"))
pd.DataFrame(records).to_csv(out/"historical_elections_staging.csv",index=False)
pd.DataFrame(exceptions).to_csv(out/"historical_exceptions.csv",index=False)
print(f"Poll rows: {len(p)}; distinct polled races: {p.election_id.nunique()}; staged election rounds: {len(records)}; exceptions: {len(exceptions)}")
print("These are staging tables; publication dates and official election results remain unverified.")
