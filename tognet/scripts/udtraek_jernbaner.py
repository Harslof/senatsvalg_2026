#!/usr/bin/env python3
"""Extract rail lines and stations from a COMPLETE EuroRegionalMap FileGDB.
Usage: py udtraek_jernbaner.py "C:\\path\\FullEurope.gdb" --only-operational
Dependencies: py -m pip install --user pyogrio geopandas
"""
import argparse
import json
from pathlib import Path
import sys

try:
    import pyogrio
except ImportError:
    sys.exit("Installer først med: py -m pip install --user pyogrio geopandas")

TARGETS = {"RAILRDL": "jernbanelinjer", "RAILRDC": "stationer"}

def main():
    p = argparse.ArgumentParser()
    p.add_argument("gdb", type=Path, help="Hele FullEurope.gdb-mappen")
    p.add_argument("--output", type=Path, default=Path("tognet_udtraek"))
    p.add_argument("--chunk", type=int, default=25000)
    p.add_argument("--only-operational", action="store_true")
    a = p.parse_args()
    if not a.gdb.is_dir() or a.chunk < 1:
        sys.exit("Angiv en eksisterende FullEurope.gdb-mappe og positiv chunk.")
    try:
        layers = {str(x[0]).upper(): str(x[0]) for x in pyogrio.list_layers(str(a.gdb))}
    except Exception as exc:
        sys.exit("GDB kan ikke åbnes: " + str(exc) + ". Alle interne filer skal være samlet.")
    print("Fundne lag:", ", ".join(layers))
    a.output.mkdir(parents=True, exist_ok=True)
    gpkg = a.output / "europas_jernbaner.gpkg"
    if gpkg.exists():
        sys.exit("Output findes allerede: " + str(gpkg) + ". Flyt eller slet før ny kørsel.")
    report = {}
    for name, target in TARGETS.items():
        if name not in layers:
            print("Laget mangler:", name)
            continue
        actual = layers[name]
        n = int(pyogrio.read_info(str(a.gdb), layer=actual).get("features") or 0)
        written = 0
        for offset in range(0, n, a.chunk):
            df = pyogrio.read_dataframe(str(a.gdb), layer=actual,
                                         skip_features=offset, max_features=a.chunk)
            if name == "RAILRDL" and a.only_operational and "EXS" in df.columns:
                df = df[df["EXS"] == 28].copy()
            if df.empty: continue
            if df.crs is None:
                sys.exit("Ingen CRS i " + name + ". Afbryder.")
            df = df.to_crs("EPSG:4326")
            pyogrio.write_dataframe(df, str(gpkg), layer=target,
                                    driver="GPKG", append=written > 0)
            written += len(df)
            print(name, offset + len(df), "/", n, "læst,", written, "skrevet", flush=True)
        report[name] = {"source_features": n, "exported_features": written,
                        "target_layer": target, "crs": "EPSG:4326"}
    (a.output / "rapport.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print("Færdig:", gpkg)

if __name__ == "__main__":
    main()
