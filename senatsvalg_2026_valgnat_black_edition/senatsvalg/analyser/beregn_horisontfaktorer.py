import pandas as pd,numpy as np
from scipy.stats import norm
from scipy.optimize import brentq
from pathlib import Path
out=Path('/mnt/data/cv_horizon_results');out.mkdir(exist_ok=True)
d=pd.read_csv('/mnt/data/historical_full_test/forecasts.csv');d=d[d.extra==0].copy()
Z=norm.ppf(.95)
# Train independent factors for each forecast model and snapshot horizon. Baseline model already has
# historic cross-year error estimate. Calibration uses historical outcomes on TRAINING years only.
def fit(g):
 e=np.abs(g.error.to_numpy()); s=g.sigma.to_numpy()
 # The empirical quantile calibrator targets 90% in training, with shared 3pp held fixed.
 # We avoid claiming continuous probability coverage, and keep multiplier bounded.
 def coverage(f):return np.mean(e<=Z*np.hypot(f*s,3))
 lo,hi=.35,3.
 if coverage(lo)>=.9:return lo
 if coverage(hi)<=.9:return hi
 return float(brentq(lambda x: np.quantile(e/Z-np.hypot(x*s,3),.9),lo,hi)) if False else float(np.quantile([0],.5))
# direct monotone binary search for coverage at or above .9
def fit(g):
 e=np.abs(g.error.to_numpy());s=g.sigma.to_numpy()
 lo,hi=.35,3.
 for _ in range(45):
  mid=(lo+hi)/2
  if np.mean(e<=Z*np.hypot(mid*s,3))>=.90:hi=mid
  else:lo=mid
 return hi
rows=[];factors=[]
for (model,days),g in d.groupby(['model','days']):
 for year in sorted(g.year.unique()):
  train=g[g.year!=year];test=g[g.year==year];factor=fit(train)
  factors.append(dict(model=model,days=days,heldout_year=year,train_n=len(train),test_n=len(test),factor=factor))
  for r in test.itertuples():
   sd0=np.hypot(r.sigma,3);sd1=np.hypot(factor*r.sigma,3)
   rows.append(dict(model=model,days=days,year=year,race=r.race,error=r.error,sigma=r.sigma,forecast=r.forecast,actual=r.actual,factor=factor,sd_before=sd0,sd_after=sd1,cover_before=int(abs(r.error)<=Z*sd0),cover_after=int(abs(r.error)<=Z*sd1),log_before=float(-norm.logpdf(r.actual,loc=r.forecast,scale=sd0)),log_after=float(-norm.logpdf(r.actual,loc=r.forecast,scale=sd1)),brier_before=float((norm.cdf(r.forecast/sd0)-(r.actual>0))**2),brier_after=float((norm.cdf(r.forecast/sd1)-(r.actual>0))**2)))
r=pd.DataFrame(rows);f=pd.DataFrame(factors)
r.to_csv(out/'heldout_predictions.csv',index=False);f.to_csv(out/'heldout_factors.csv',index=False)
summary=r.groupby(['model','days']).agg(n=('year','size'),years=('year','nunique'),coverage_before=('cover_before','mean'),coverage_after=('cover_after','mean'),log_before=('log_before','mean'),log_after=('log_after','mean'),brier_before=('brier_before','mean'),brier_after=('brier_after','mean'),factor_median=('factor','median'),factor_min=('factor','min'),factor_max=('factor','max')).reset_index()
summary.to_csv(out/'summary.csv',index=False)
print(summary.to_string(index=False))
print('\nmedian factors',f.groupby(['model','days']).factor.median())
