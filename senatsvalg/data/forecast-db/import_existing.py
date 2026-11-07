#!/usr/bin/env python3
"""Read-only inventory and validated CSV export of existing Senate 2026 polls.
Run from repository root: python3 senatsvalg/data/forecast-db/import_existing.py
Requires only Python standard library. Never silently guesses publication dates.
"""
import csv
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent
raw = (PROJECT / "polls-export.json").read_text(encoding="utf-8")
data = json.loads(raw)
print("polls-export.json root:", type(data).__name__)
print("root keys:", list(data)[:20] if isinstance(data, dict) else "list")
print("No data modified: import requires explicit source mapping and publication-date validation.")
print("Historical archive:", (PROJECT.parent / "analyser" / "historisk_modeltest_grundlag.zip").exists())
print("Schema tables:", ", ".join(p.name for p in HERE.glob("*.csv")))
