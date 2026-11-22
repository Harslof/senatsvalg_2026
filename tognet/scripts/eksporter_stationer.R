# EuroRegionalMap 2026: eksport af stationspunkter fra RailrdC
# Kør i RStudio efter: output <- "C:/.../europas_jernbaner.gpkg"
pacman::p_load(sf, dplyr)
stopifnot(exists("output"), file.exists(output))

folder <- file.path(dirname(output), "webstationer")
dir.create(folder, recursive=TRUE, showWarnings=FALSE)

# Samme landekoder som vores eksisterende kort
countries <- c("AT","BE","CH","CZ","DE","DK","EE","ES","FI","FR","GB","GE",
               "GR","HR","IE","IT","LI","LT","LU","LV","MC","MD","MK",
               "NL","NO","PL","PT","SE","SI","SK","UA")
results <- list()
for (cc in countries) {
  sql <- sprintf('SELECT * FROM "RailrdC" WHERE "ICC" = \'%s\'', cc)
  stations <- sf::st_read(output, query=sql, quiet=TRUE)
  if (!nrow(stations)) next
  # For at bevare stationernes beskrivende felter bruger vi dem alle indledningsvis.
  stations <- sf::st_transform(stations, 4326)
  path <- file.path(folder, paste0("stationer_", cc, ".geojson"))
  if (file.exists(path)) file.remove(path)
  sf::st_write(stations, path, driver="GeoJSON", quiet=TRUE)
  results[[cc]] <- data.frame(country=cc, stations=nrow(stations),
                              mb=round(file.info(path)$size / 1024^2, 2))
  message(cc, ": ", nrow(stations), " stationsobjekter")
}
if (length(results)) {
  report <- do.call(rbind, results)
  print(report, row.names=FALSE)
  write.csv(report, file.path(folder,"stationsoversigt.csv"), row.names=FALSE)
}
# NB: GeoRegionalMap RailrdC omfatter punkter registreret i datasættet,
# ikke nødvendigvis alle passagerstationer og stoppesteder.
# Upload de eksportfiler der er små nok, til tognet/data/processed i GitHub.
