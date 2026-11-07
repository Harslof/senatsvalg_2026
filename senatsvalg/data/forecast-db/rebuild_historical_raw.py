#!/usr/bin/env python3
"""Rebuild the archived historical polling inputs without changing production models."""
from pathlib import Path
import csv
import hashlib

ROOT=Path(__file__).resolve().parent
RAW=ROOT/"raw"
def join_parts(stem,parts,expected_lines):
    sources=[RAW/f"{stem}.part{i:02d}.csv.txt" for i in range(1,parts+1)]
    missing=[str(p) for p in sources if not p.is_file()]
    if missing: raise FileNotFoundError(missing)
    output=RAW/f"{stem}.csv"
    with output.open("w",encoding="utf-8",newline="") as target:
        for p in sources: target.write(p.read_text(encoding="utf-8"))
    with output.open(encoding="utf-8",newline="") as f:
        rows=sum(1 for _ in csv.reader(f))
    if rows!=expected_lines: raise ValueError(f"{stem}: {rows} CSV rows, expected {expected_lines}")
    print(output,rows,"rows",hashlib.sha256(output.read_bytes()).hexdigest())
    return output

def main():
    current=join_parts("538_raw_polls_1998_2022",5,20467)
    legacy=join_parts("538_raw_polls_legacy",3,11476)
    mit=RAW/"mit_senate_1976_2024.csv"
    with mit.open(encoding="utf-8",newline="") as f: mit_rows=sum(1 for _ in csv.reader(f))
    if mit_rows!=3946: raise ValueError(f"MIT row count mismatch: {mit_rows}")
    print(mit,mit_rows,"rows",hashlib.sha256(mit.read_bytes()).hexdigest())
    # A distinct, clearly labeled polling subset; never confuse it with verified election results.
    out=ROOT/"staging"/"538_senate_general_polls_from_raw.csv"
    out.parent.mkdir(parents=True,exist_ok=True)
    with current.open(encoding="utf-8",newline="") as f, out.open("w",encoding="utf-8",newline="") as g:
        reader=csv.DictReader(f)
        writer=csv.DictWriter(g,fieldnames=reader.fieldnames)
        writer.writeheader()
        n=0
        for row in reader:
            if row["type_simple"]=="Sen-G":
                writer.writerow(row);n+=1
    print(out,n,"Sen-G polling rows")
    print("Legacy raw polls preserved at",legacy,"but not merged blindly: overlapping polls need deduplication.")
    print("No FEC verification or website model changes performed.")
if __name__=="__main__": main()
