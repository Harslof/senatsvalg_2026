# EuroRegionalMap 2026: eksportér alle lande til web-GeoJSON
# Forudsætter at 'output' i R er stien til europas_jernbaner.gpkg
pacman::p_load(sf, dplyr, jsonlite)
stopifnot(exists("output"), file.exists(output))
destination <- file.path(dirname(output), "webdata_alle")
dir.create(destination, showWarnings = FALSE, recursive = TRUE)

# Kun disse geografiske lande i første omgang. Tilføj ved behov.
countries <- c("AT","BE","CH","CZ","DK","EE","ES","FI","FR","GB","GR",
  "HR","IE","IT","LT","LU","LV","MD","MK","NL","NO","PL","PT","SE",
  "SI","SK","UA","DE","GE","LI","MC")
labels <- c(AT="Østrig",BE="Belgien",CH="Schweiz",CZ="Tjekkiet",
 DK="Danmark",EE="Estland",ES="Spanien",FI="Finland",FR="Frankrig",
 GB="Storbritannien",GR="Grækenland",HR="Kroatien",IE="Irland",
 IT="Italien",LT="Litauen",LU="Luxembourg",LV="Letland",
 MD="Moldova",MK="Nordmakedonien",NL="Nederlandene",NO="Norge",
 PL="Polen",PT="Portugal",SE="Sverige",SI="Slovenien",
 SK="Slovakiet",UA="Ukraine",DE="Tyskland",GE="Georgien",
 LI="Liechtenstein",MC="Monaco")

summary_list <- list()
for (country in countries) {
  target <- file.path(destination, paste0("jernbaner_", country, ".geojson"))
  if (file.exists(target)) {
    message("Springer over (findes): ", country)
    next
  }
  sql <- paste0("SELECT * FROM \"RailrdL\" WHERE \"ICC\" = '",
                country, "' AND \"EXS\" = 28 AND \"F_CODE\" = 'AN010'")
  message("Læser ", country)
  lines <- sf::st_read(output, query = sql, quiet = TRUE)
  if (nrow(lines) == 0) next
  lines <- dplyr::select(lines, inspireId, ICC, LEN, EXS, RRC, RSD,
                         RRA, RGC, TEN, TENTEC_ID)
  # Forenkling er kun til kortvisning; der må ikke routes eller måles på disse linjer.
  lines <- sf::st_transform(lines, 3035)
  lines <- sf::st_simplify(lines, dTolerance = 200)
  lines <- sf::st_transform(lines, 4326)
  sf::st_write(lines, target, driver = "GeoJSON", quiet = TRUE)
  summary_list[[country]] <- data.frame(
    code = country, name = unname(labels[country]),
    features = nrow(lines),
    file = basename(target),
    size_mb = round(file.info(target)$size / 1024^2, 2)
  )
  message(country, ": ", nrow(lines), " objekter, ",
          round(file.info(target)$size/1024^2, 2), " MB")
  rm(lines)
  gc(verbose = FALSE)
}
if(length(summary_list)){
  report <- do.call(rbind, summary_list)
  write.csv(report, file.path(destination, "eksportoversigt.csv"), row.names=FALSE)
  print(report, row.names=FALSE)
}
message("Upload kun filer under GitHubs browsergrænse på 25 MiB, og opdatér manifest.json.")
