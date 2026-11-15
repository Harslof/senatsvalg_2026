# Europas tognet

Et selvstændigt projekt på Kontur om Europas jernbaneinfrastruktur, TEN-T og forbindelser på tværs af landegrænser.

## Status (15. november 2026)
- Ny helskærmssektion indsat i rodens index.html.
- Projektets landingsside er oprettet i tognet/index.html.
- Kunstnerisk SVG i tognet/assets/europas-tognet.svg (ikke geodata eller faktiske linjeføringer).
- Interaktivt GIS-kort og databehandling er endnu ikke implementeret.

## Foreslået udviklingsplan

1. **Datakontrakt**: Definér Europa-afgrænsning, aktive jernbaner versus nedlagte/planlagte, person- og godstrafik, koordinatsystem og opdateringsdato.
2. **Grundnet**: Brug Geofabrik/OpenStreetMap per land. Filtrér railway=rail og eventuelt light_rail/subway separat; ekskludér proposed, abandoned, disused og construction fra standardvisningen. Gem kilde/licens.
3. **GIS-proces**: Saml data i GeoPackage/GeoParquet, normalisér attributter og kontrollér geometrier og grænseoverskridende sammenhæng. Udarbejd TopoJSON eller vector tiles i flere zoomniveauer.
4. **Interaktivt kort**: Byg med MapLibre GL JS og lag for spor, stationer og TEN-T; tilføj søgning, filtrering og forklarende infopanel.
5. **TEN-T-lag**: Find autoritative geometriske data fra TENtec, dokumentér hvilket net og hvilken revision der bruges, og tilføj de ni European Transport Corridors med særskilt signaturforklaring.
6. **Tekniske data**: Undersøg ERA RINF med forsigtig geografisk matchning til grundnettet; vis ufuldstændig dækning tydeligt.
7. **Kvalitetskontrol**: Test Danmark–Tyskland, Sverige–Norge, Spanien–Frankrig, Balkan og Baltikum; efterprøv mobile visninger og sideindlæsning.
8. **Publicering**: Gem små optimerede datasæt i projektet; større eller automatiske pipelines som GitHub Actions med klare licenser og versionsdatoer.

## Kilder
- OSM/Geofabrik: https://download.geofabrik.de/europe.html — ODbL 1.0.
- TENtec: https://transport.ec.europa.eu/transport-themes/infrastructure-and-investment/trans-european-transport-network-ten-t/tentec-information-system-and-ten-t-map-library_en
- EuroGlobalMap: https://www.mapsforeurope.org/datasets/euro-global-map/
- UNECE TER: https://unece.org/transport/ter/ter-gis
- EU Agency for Railways: https://www.era.europa.eu/

## Foreslået fremtidig struktur
```
tognet/
  index.html
  css/
    kort.css
  js/
    kort.js
    lag.js
  assets/
    europas-tognet.svg
  data/
    processed/
  scripts/
    build-rail-network.py
  README.md
```
Kun filer til den første landingsside findes endnu.
