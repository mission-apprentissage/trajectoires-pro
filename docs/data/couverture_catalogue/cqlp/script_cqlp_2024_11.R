#Librairies ----
library(tidyverse)
library(readxl)
library(rmarkdown)

setwd(dirname(rstudioapi::getSourceEditorContext()$path))

chemin_racine <- "../../../.."
chemin_racine_data <- file.path(chemin_racine,"0- data")
source("prepa_data_init_generique.R")

FormationEtablissement <- read_csv(file.path(chemin_racine_data,"Donnees IJ/metabase/Recette - CQLP/FormationEtablissement.csv"))
Formation <- read_csv(file.path(chemin_racine_data,"Donnees IJ/metabase/Recette - CQLP/Formation.csv"))
Etablissement <- read_csv(file.path(chemin_racine_data,"Donnees IJ/metabase/Recette - CQLP/Etablissement.csv"))


catalogue_cqlp_simpli <- FormationEtablissement %>% 
  left_join(
    Formation %>% 
      select(ID,Cfd,Mef11,Voie) %>% 
      mutate(code_certification=ifelse(Voie=="scolaire",Mef11,Cfd)),
    by=c("FormationId"="ID")
  ) %>% 
  left_join(
    Etablissement %>% 
      select(ID,Uai),
    by=c("EtablissementId"="ID")
  ) %>% 
  filter(str_detect(Millesime,"2024")) %>% 
  select(Uai,Mef11,Cfd,Voie,code_certification)%>% 
  setNames(c("UAI","MEFSTAT11","FORMATION_DIPLOME","Filiere","code_certification")) %>% 
  mutate(Filiere=ifelse(Filiere=="apprentissage","Apprentissage","Scolaire"))

catalogue_cqlp_simpli_renseigne <- expo_mef_catalogue_partenaire(catalogue_init = catalogue_cqlp_simpli,type_source = "cqlp")

stats_catalogue_cqlp_simpli <- expo_mef_stats_catalogue_partenaire(
  catalogue_partenaire_renseigne = catalogue_cqlp_simpli_renseigne,
  type_voeux="affelnet"
)  