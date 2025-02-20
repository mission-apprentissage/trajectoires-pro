# Chargement des librairies ----
library(tidyverse)
library(readxl)

setwd(dirname(rstudioapi::getSourceEditorContext()$path))


chemin_projet_generique <- "C:/Users/arnau/d-sidd Dropbox/Arnaud milet/0_beta/1- Exposition/Groupe-002 - Parcoursup/002 - 4 - Prepa ParcourSup 2025/script_appariement_ps"
chemin_projet_2025 <- "C:/Users/arnau/d-sidd Dropbox/Arnaud milet/0_beta/1- Exposition/Groupe-002 - Parcoursup/002 - 4 - Prepa ParcourSup 2025/2_script_appariement_ps_2025"
# chemin_projet <- file.path("../../../../Groupe-002 - Parcoursup/002 - 4 - Prepa ParcourSup 2025/2_script_appariement_ps_2025")

#lancer les scripts d'appariement ----
## Imports des données ----
#Ce premier script d'import des données est potentiellement chronophage,
#en fin de script il enregistre une image des données prepa_ps_2025.RData qu'on peut charger plutôt que de relancer systématiquement le premier script.

# source("2_script_appariement_ps_2025/3_0_script_prepa_ps_2025_import_data.R")
# rm(list=ls())
<<<<<<< HEAD
load(file.path(chemin_projet_2025,"prepa_ps_2025.RData"))

chemin_racine_data <- "../../../../0- data" 
chemin_racine_data <- "../../../../Groupe-002 - Parcoursup/002 - 4 - Prepa ParcourSup 2025/script_appariement_ps/data_utiles"
chemin_racine_data <- "C:/Users/arnau/d-sidd Dropbox/Arnaud milet/0_beta/1- Exposition/Groupe-002 - Parcoursup/002 - 4 - Prepa ParcourSup 2025/script_appariement_ps/data_utiles"
source(file.path(chemin_projet_2025,"3_0_script_prepa_ps_2025_patch_insersup_api.R"))
print("Fin patch_insersup_api")
source(file.path(chemin_projet_generique,"scripts_appariements/1_script_prepa_ps_prepa_data.R"))
print("Fin 1_script_prepa_ps_prepa_data.R")

source(file.path(chemin_projet_generique,"scripts_appariements/2_script_prepa_ps_focus_ij.R"))
print("Fin 2_script_prepa_ps_focus_ij.R")

source(file.path(chemin_projet_generique,"scripts_appariements/3_script_prepa_ps_focus_sup.R"))
print("Fin 3_script_prepa_ps_focus_sup.R")

source(file.path(chemin_projet_generique,"scripts_appariements/4_script_prepa_ps_ajout_remuneration.R"))
print("Fin 4_script_prepa_ps_ajout_remuneration.R")

source(file.path(chemin_projet_generique,"scripts_appariements/5_script_prepa_ps_raison_non_couverture_non_ij_non_sup.R"))
print("Fin 5_script_prepa_ps_raison_non_couverture_non_ij_non_sup.R")

source(file.path(chemin_projet_generique,"scripts_appariements/6_script_prepa_ps_appariement_sies_passage_reussite.R"))
print("Fin 6_script_prepa_ps_appariement_sies_passage_reussite.R")

source(file.path(chemin_projet_generique,"scripts_appariements/7_script_prepa_ps_analyse_couverture.R"))
print("Fin 7_script_prepa_ps_analyse_couverture.R")
=======
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
>>>>>>> main
