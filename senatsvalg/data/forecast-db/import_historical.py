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
e=e[(e.year>=1998)&(e.stage.str.lower()=="gen")&(e["mode"].astype(str).str.lower()=="total")].copy()
e["special"]=e.special.fillna(False)
e["election_id"]=e.year.astype(str)+"_Sen-G_"+e.state_po.astype(str)+e.special.map({True:"_SPECIAL",False:""})
e["verification_status"]="source_dataset_unverified_against_official"
e[["election_id","year","state","state_po","special","candidate","party_detailed","party_simplified","candidatevotes","totalvotes","unofficial","version","verification_status"]].to_csv(out/"historical_candidate_results.csv",index=False)
records=[];exceptions=[]
for eid,g in e.groupby("election_id"):
    d=g[g.party_simplified=="DEMOCRAT"];r=g[g.party_simplified=="REPUBLICAN"];tot=g.totalvotes.dropna().unique()
    if len(d)!=1 or len(r)!=1 or len(tot)!=1 or tot[0]<=0:
        exceptions.append(dict(election_id=eid,dem_candidate_rows=len(d),rep_candidate_rows=len(r),totalvotes_variants=len(tot)))
        continue
    records.append(dict(election_id=eid,year=int(g.year.iloc[0]),state=g.state_po.iloc[0],special=bool(g.special.iloc[0]),dem_candidate=d.candidate.iloc[0],rep_candidate=r.candidate.iloc[0],dem_votes=d.candidatevotes.iloc[0],rep_votes=r.candidatevotes.iloc[0],total_votes=tot[0],dem_margin_pp=100*(d.candidatevotes.iloc[0]-r.candidatevotes.iloc[0])/tot[0],verification_status="MIT_dataset_unverified_against_official"))
pd.DataFrame(records).to_csv(out/"historical_elections_staging.csv",index=False)
pd.DataFrame(exceptions).to_csv(out/"historical_exceptions.csv",index=False)
print(f"Poll rows: {len(p)}; distinct polled races: {p.election_id.nunique()}; staged elections: {len(records)}; exceptions: {len(exceptions)}")
print("These are staging tables; publication dates and official election results remain unverified.")
