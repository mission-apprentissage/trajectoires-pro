# Chargement des librairies ----
library(tidyverse)
library(readxl)

setwd(dirname(rstudioapi::getSourceEditorContext()$path))

chemin_projet <- "C:/Users/arnau/d-sidd Dropbox/Arnaud milet/0_beta/1- Exposition/Groupe-002 - Parcoursup/002 - 4 - Prepa ParcourSup 2025/3_script_campagne_2024"
# chemin_projet <- file.path("../../../../Groupe-002 - Parcoursup/002 - 4 - Prepa ParcourSup 2025/3_script_campagne_2024")

#lancer les scripts d'appariement ----
## Imports des données ----
#Ce premier script d'import des données est potentiellement chronophage,
#en fin de script il enregistre une image des données campagne_2024.RData qu'on peut charger plutôt que de relancer systématiquement le premier script.

# source("3_script_campagne_2024/3_0_script_campagne_2024_import_data.R")
# rm(list=ls())
load(file.path(chemin_projet,"prepa_campagne_2024.RData"))

source(file.path(chemin_projet,"3_1_script_campagne_2024_prepa_data.R"))
source(file.path(chemin_projet,"3_2_script_campagne_2024_focus_ij.R"))
source(file.path(chemin_projet,"3_3_script_campagne_2024_focus_sup.R"))
source(file.path(chemin_projet,"3_4_script_campagne_2024_ajout_remuneration.R"))
source(file.path(chemin_projet,"3_5_script_campagne_2024_raison_non_couverture_non_ij_non_sup.R"))
source(file.path(chemin_projet,"3_6_script_campagne_2024_appariement_sies_passage_reussite.R"))
source(file.path(chemin_projet,"3_7_script_campagne_2024_debug_continuum.R"))
source(file.path(chemin_projet,"3_8_script_campagne_2024_analyse_couverture.R"))