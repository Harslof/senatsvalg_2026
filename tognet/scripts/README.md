# Udtræk af EuroRegionalMap 2026
Dette script læser den **komplette** `FullEurope.gdb`-mappe med Python uden QGIS, finder `RAILRDL` og `RAILRDC` og skriver GeoPackage i EPSG:4326.

Installer Python og pakker: `py -m pip install --user pyogrio geopandas`.

Kør derefter `py udtraek_jernbaner.py "C:\\sti\\til\\FullEurope.gdb" --only-operational`.

Bemærk: File Geodatabase er en samlet mappe med indbyrdes afhængige systemfiler. Enkelte uploadede .gdbtable/.gdbtablx-filer er ikke en komplet database. Publicér ikke de originale rådata på GitHub; læg kun små optimerede, licenskontrollerede kortfiler på GitHub Pages. Scriptet er syntakskontrolleret, men kan først funktionstestes mod den komplette GDB.
