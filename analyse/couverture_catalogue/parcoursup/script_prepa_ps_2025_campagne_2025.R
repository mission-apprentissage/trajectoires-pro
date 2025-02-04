# Chargement des librairies ----
library(tidyverse)
library(readxl)

setwd(dirname(rstudioapi::getSourceEditorContext()$path))

chemin_projet <- "C:/Users/arnau/d-sidd Dropbox/Arnaud milet/0_beta/1- Exposition/Groupe-002 - Parcoursup/002 - 4 - Prepa ParcourSup 2025/2_script_appariement_ps_2025"
# chemin_projet <- file.path("../../../../Groupe-002 - Parcoursup/002 - 4 - Prepa ParcourSup 2025/2_script_appariement_ps_2025")

#lancer les scripts d'appariement ----
## Imports des données ----
#Ce premier script d'import des données est potentiellement chronophage,
#en fin de script il enregistre une image des données prepa_ps_2025.RData qu'on peut charger plutôt que de relancer systématiquement le premier script.

# source("2_script_appariement_ps_2025/3_0_script_prepa_ps_2025_import_data.R")
# rm(list=ls())
load(file.path(chemin_projet,"prepa_ps_2025.RData"))
chemin_racine_data <- "../../../../0- data" 

source(file.path(chemin_projet,"3_0_script_prepa_ps_2025_patch_insersup_api.R"))

source(file.path(chemin_projet,"3_1_script_prepa_ps_2025_prepa_data.R"))
source(file.path(chemin_projet,"3_2_script_prepa_ps_2025_focus_ij.R"))
source(file.path(chemin_projet,"3_3_script_prepa_ps_2025_focus_sup.R"))
source(file.path(chemin_projet,"3_4_script_prepa_ps_2025_ajout_remuneration.R"))
source(file.path(chemin_projet,"3_5_script_prepa_ps_2025_raison_non_couverture_non_ij_non_sup.R"))
source(file.path(chemin_projet,"3_6_script_prepa_ps_2025_appariement_sies_passage_reussite.R"))
#source(file.path(chemin_projet,"3_7_script_prepa_ps_2025_debug_continuum.R"))
source(file.path(chemin_projet,"3_8_script_prepa_ps_2025_analyse_couverture.R"))