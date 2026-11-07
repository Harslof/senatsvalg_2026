#!/usr/bin/env python3
"""Historical Senate benchmark: 12/8/4/2 weeks, three polling-only models.

Run after import_historical.py:
  python benchmark_horizons.py --polls historical_polls_538.csv --date-policy proxy
Use --date-policy strict only after independent publication dates have been supplied.
Proxy mode uses fieldwork midpoints and is NOT a leakage-free test.
Historical margin_actual is a source reference, NOT an officially verified result.
"""
import argparse
import json
from pathlib import Path
import numpy as np
import pandas as pd

def run(a):
    p = pd.read_csv(a.polls, low_memory=False)
    required = {'race','poll_id','question_id','polldate','electiondate','margin_poll','margin_actual'}
    if required - set(p): raise ValueError(f"Missing: {sorted(required-set(p))}")
    if 'type_simple' in p: p = p[p.type_simple.eq('Sen-G')].copy()
    if {'cand1_party','cand2_party'} <= set(p):
        p = p[p.cand1_party.eq('DEM') & p.cand2_party.eq('REP')].copy()
    p = p.drop_duplicates(['race','poll_id','question_id'])
    for c in ('polldate','electiondate','publication_date'):
        if c in p: p[c] = pd.to_datetime(p[c],errors='coerce')
    for c in ('margin_poll','margin_actual'):
        p[c] = pd.to_numeric(p[c],errors='coerce')
    if a.date_policy == 'strict' and 'publication_date' not in p:
        raise ValueError('Strict mode requires publication_date')
    p['known_at'] = p.publication_date if a.date_policy == 'strict' else p.polldate
    p = p.dropna(subset=['race','known_at','polldate','electiondate','margin_poll','margin_actual'])
    inconsistent = p.groupby('race').margin_actual.agg(lambda s: s.max()-s.min())
    excluded = set(inconsistent[inconsistent.gt(.02)].index)
    p = p[~p.race.isin(excluded)]
    rows, cover = [], []
    for (race,eday),g in p.groupby(['race','electiondate']):
        actual = float(g.margin_actual.median())
        for h in (84,56,28,14):
            cutoff = eday-pd.Timedelta(days=h)
            q = g[g.known_at.le(cutoff) & g.polldate.le(cutoff)].copy()
            if 'field_end' in q:
                q['field_end'] = pd.to_datetime(q.field_end,errors='coerce')
                q = q[q.field_end.le(cutoff)]
            n = len(q)
            span = (q.known_at.max()-q.known_at.min()).days if n else 0
            good = n >= a.min_polls and span >= a.min_span_days
            cover.append(dict(race=race,horizon_days=h,polls=n,span_days=span,eligible=good))
            if not good: continue
            ages = (cutoff-q.known_at).dt.days.to_numpy(dtype=float)
            y = q.margin_poll.to_numpy(dtype=float)
            w = 2**(-ages/a.half_life)
            avg = float(np.mean(y))
            weighted = float(np.average(y,weights=w))
            x = -ages/7
            slope = float(np.polyfit(x,y,1)[0]) if n>=3 and np.ptp(x)>=2 else 0.
            slope = float(np.clip(slope,-a.max_slope,a.max_slope))
            linear = float(np.clip(weighted+slope*np.average(ages,weights=w)/7,-100,100))
            for model,pred in (('mean',avg),('time_weighted',weighted),('linear_trend',linear)):
                err=pred-actual
                rows.append(dict(race=race,year=eday.year,horizon_days=h,model=model,
                    predicted_margin_pp=pred,actual_margin_pp=actual,error_pp=err,
                    absolute_error_pp=abs(err),squared_error_pp2=err*err,
                    polls_used=n,span_days=span,date_policy=a.date_policy))
    out=Path(a.output);out.mkdir(parents=True,exist_ok=True)
    d=pd.DataFrame(rows)
    d.to_csv(out/'predictions.csv',index=False)
    pd.DataFrame(cover).to_csv(out/'coverage.csv',index=False)
    if len(d):
        s=d.groupby(['horizon_days','model'],as_index=False).agg(
            races=('race','nunique'),mae=('absolute_error_pp','mean'),
            bias=('error_pp','mean'),mse=('squared_error_pp2','mean'))
        s['rmse']=np.sqrt(s.pop('mse'))
    else:
        s=pd.DataFrame(columns=['horizon_days','model','races','mae','bias','rmse'])
    s.to_csv(out/'summary.csv',index=False)
    (out/'run_manifest.json').write_text(json.dumps(dict(
        source='FiveThirtyEight historical raw polls',date_policy=a.date_policy,
        outcome='538 margin_actual; not independently certified',
        horizons_days=[84,56,28,14],min_polls=a.min_polls,
        min_span_days=a.min_span_days,half_life_days=a.half_life,
        max_slope_pp_per_week=a.max_slope,
        excluded_inconsistent_reference_races=sorted(excluded),
        warning='Midpoint-date proxy can leak polls; strict mode requires verified publication dates',
        compared_on='identical race cohort within each horizon'),indent=2))
    print('Predictions:',len(d),'race/horizon checks:',len(cover),'output:',out)

if __name__=='__main__':
    ap=argparse.ArgumentParser()
    ap.add_argument('--polls',required=True)
    ap.add_argument('--output',default='benchmark-output')
    ap.add_argument('--date-policy',choices=['strict','proxy'],default='strict')
    ap.add_argument('--min-polls',type=int,default=3)
    ap.add_argument('--min-span-days',type=int,default=14)
    ap.add_argument('--half-life',type=float,default=28)
    ap.add_argument('--max-slope',type=float,default=2)
    run(ap.parse_args())
