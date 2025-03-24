# Chargement des librairies ----
library(tidyverse)
library(readxl)
# lancer les scripts d'appariement ----
##1- Imports des données ----
#Ce premier script d'import des données est potentiellement chronophage,
#en fin de script il enregistre une image des données prepa_ps_2025.RData qu'on peut charger plutôt que de relancer systématiquement le premier script.


# Définition du chemin racine pour les données (à adapter selon l'emplacement des fichiers)

choix_api_exposition <- "recette"
setwd(dirname(rstudioapi::getSourceEditorContext()$path))


chemin_projet_generique <- "C:/Users/arnau/d-sidd Dropbox/Arnaud milet/0_beta/1- Exposition/Groupe-002 - Parcoursup/002 - 4 - Prepa ParcourSup 2025/script_appariement_ps"

### Clés API utiles au moment de l'import des données ----

#### API Exposition InserJeunes ----
# apiKey_ij <- XXXXXXX #clé de l'API Exposition InserJeunes: https://exposition.inserjeunes.beta.gouv.fr/api/doc/

#### API Certif Info ----
# token_ci <- XXXXXXX #clé de l’API Certif Info : https://api-certifinfo.intercariforef.org/docs

urls <- list(
  exposition_ij= list(
    production = "https://exposition.inserjeunes.beta.gouv.fr",
    recette = "https://recette.exposition.inserjeunes.incubateur.net"
  )
)


ensemble_key <- readRDS("C:/Users/arnau/d-sidd Dropbox/Arnaud milet/0_beta/1- Exposition/Groupe-002 - Parcoursup/002 - 4 - Prepa ParcourSup 2025/data/ensemble_key.rds") #les clés peuvent être stockées dans un fichier si nécéssaire
apiKey_ij <- ensemble_key$apiKey_ij
token_ci <- ensemble_key$token_ci

# source("scripts_appariements/0_script_prepa_ps_import_data.R")
# source("scripts_appariements/0_script_prepa_ps_2025_ajout_encodages_manuels.R")

##2- Recherche des codes certification potentiels ----
# source("scripts_appariements/1_script_prepa_ps_prepa_data.R")


# Sauvegarde de l'image des données importées et pré-traitées
# ___________________________________________________________
# !!! Il est fortement conseillé d'enregistrer les données importées et pré-traitées car ces étapes
# sont chronophages.
# ___________________________________________________________
# save.image("prepa_ps_2025.RData")
# rm(list=ls())
# Charger l'image des données predemment importées
load(file.path(chemin_projet_generique,"prepa_ps_2025.RData"))
chemin_racine_data <- "C:/Users/arnau/d-sidd Dropbox/Arnaud milet/0_beta/1- Exposition/Groupe-002 - Parcoursup/002 - 4 - Prepa ParcourSup 2025/script_appariement_ps/data_utiles"

##3- Appariements avec les données Exposition Inserjeunes et autres services ----
source(file.path(chemin_projet_generique,"scripts_appariements/2_1_script_prepa_ps_focus_insertion.R"))
source(file.path(chemin_projet_generique,"scripts_appariements/2_2_script_prepa_ps_focus_remuneration.R"))
source(file.path(chemin_projet_generique,"scripts_appariements/2_3_script_prepa_ps_focus_passage_reussite.R"))

##4- Agrégation des appariements ----
source(file.path(chemin_projet_generique,"scripts_appariements/3_script_prepa_ps_agregation_focus.R"))

## Analyse de couverture ----
source(file.path(chemin_projet_generique,"scripts_appariements/4_script_prepa_ps_analyse_couverture.R"))