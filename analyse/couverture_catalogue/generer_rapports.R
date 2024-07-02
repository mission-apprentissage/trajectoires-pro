library(tidyverse)
library(readxl)
library(rmarkdown)

setwd(dirname(rstudioapi::getSourceEditorContext()$path))

chemin_racine_data <- "../../../../0- data" 
source("prepa_data_init_generique.R")


### 20240531 - Extraction catalogue SLA 2024----
Affelnet_20240531_Extraction_catalogue_SLA_2024  <- read_excel(file.path(chemin_racine_data,"affelnet/2024/20240531 - Catalogue offres voie professionnelle - AFFELNET.xlsx") ) 


affelnet_simpli  <- Affelnet_20240531_Extraction_catalogue_SLA_2024 %>% 
  filter(!Académie%in% c("Polynesie","Nvelle-Caledonie"),`Visible portail`=="O") %>% 
  select(Etablissement,MEF,Statut) %>% 
  setNames(c("UAI","MEFSTAT11","Filiere")) %>% 
  mutate(Filiere=ifelse(Filiere=="AP","Apprentissage","Scolaire")) 


rmarkdown::render("stats_catalogue_generique.Rmd", 
                  params = list(
                    catalogue_init=affelnet_simpli,
                    type_source ="affelnet",
                    nom_catalogue= "Affelnet",
                    nom_catalogue_detail = "Catalogue Affelnet 2024 V20240531_Extraction_catalogue_SLA_2024",
                    lien_drive_catalogue ="https://docs.google.com/spreadsheets/d/1i3URB63eaiQJ9UfteY4_PULom_I5f1wK/edit#gid=397487575"
                  ),
                  output_format = "html_document",
                  output_dir = "affelnet",
                  output_file = "affelnet_V20240531_Extraction_catalogue_SLA_2024.html"
)


### 20240514 - Extraction catalogue SLA 2024----

Affelnet_20240514_Extraction_catalogue_SLA_2024  <- read_excel(file.path(chemin_racine_data,"affelnet/2024/20240570 - Catalogue SLA 2024 OF de voie professionnelle.xlsx"),
                                                               skip = 2)

affelnet_simpli <- Affelnet_20240514_Extraction_catalogue_SLA_2024 %>% 
  select(Etablissement,MEFSTAT11,Statut) %>% 
  setNames(c("UAI","MEFSTAT11","Filiere")) %>% 
  mutate(Filiere=ifelse(Filiere=="AP","Apprentissage","Scolaire"))

rmarkdown::render("stats_catalogue_generique.Rmd", 
                  params = list(
                    catalogue_init=affelnet_simpli,
                    type_source ="affelnet",
                    nom_catalogue= "Affelnet",
                    nom_catalogue_detail = "Catalogue Affelnet 2024 V20240514_Extraction_catalogue_SLA_2024",
                    lien_drive_catalogue ="https://docs.google.com/spreadsheets/d/1X3WJAe3yy-fK5u8TvUVnbNOq67mye0D6/edit?usp=drive_link&ouid=107607241761816962784&rtpof=true&sd=true"
                  ),
                  output_format = "html_document",
                  output_dir = "affelnet",
                  output_file = "affelnet_V20240514_Extraction_catalogue_SLA_2024.html"
)

### 20240112 - Extraction catalogue SLA 2023----

Affelnet_20240112_Extraction_catalogue_SLA_2023 <- read_excel(file.path(chemin_racine_data,"affelnet/2023/20240112 - Extraction catalogue SLA 2023.xlsx"),
                                                              skip = 2)

affelnet_simpli <- Affelnet_20240112_Extraction_catalogue_SLA_2023 %>% 
  select(Etablissement,MEFSTAT11,Statut) %>% 
  setNames(c("UAI","MEFSTAT11","Filiere")) %>% 
  mutate(Filiere=ifelse(Filiere=="AP","Apprentissage","Scolaire"))

rmarkdown::render("stats_catalogue_generique.Rmd", 
                  params = list(
                    catalogue_init=affelnet_simpli,
                    type_source ="affelnet",
                    nom_catalogue= "Affelnet",
                    nom_catalogue_detail = "Catalogue Affelnet 2023 V20240112_Extraction_catalogue_SLA_2023",
                    lien_drive_catalogue ="https://docs.google.com/spreadsheets/d/100miT_jBPQuXo-rA0HnGWX0v2W84Po9m/edit?usp=drive_link&ouid=107607241761816962784&rtpof=true&sd=true"
                  ),
                  output_format = "html_document",
                  output_dir = "affelnet",
                  output_file = "affelnet_V20240112_Extraction_catalogue_SLA_2023.html"
)


### onisep 05_2024----

ideo_actions_de_formation_initiale_univers_lycee <- read_csv2(file.path(chemin_racine_data,"onisep/ideo-actions_de_formation_initiale-univers_lycee.csv"))

ideo_formations_initiales_en_france <- read_csv2(file.path(chemin_racine_data,"onisep/ideo-formations_initiales_en_france.csv"))


ideo_actions_de_formation_initiale_univers_lycee_rens <- ideo_actions_de_formation_initiale_univers_lycee %>% 
  left_join(
    ideo_formations_initiales_en_france %>% 
      distinct(`code scolarité`,`URL et ID Onisep`,durée),
    by=c("FOR URL et ID Onisep"="URL et ID Onisep")
  ) %>% 
  mutate(
    duree=as.numeric(str_split_fixed(durée," ",n=2)[,1]),
    unite_duree=str_split_fixed(durée," ",n=2)[,2]
  ) %>% 
  left_join(
    n_mef %>% 
      filter(DUREE_DISPOSITIF==ANNEE_DISPOSITIF) %>% 
      distinct(FORMATION_DIPLOME,DUREE_DISPOSITIF,MEF_STAT_11) %>% 
      mutate(
        ANNEE_DISPOSITIF=as.numeric(str_sub(MEF_STAT_11,4,4))
      ) %>% 
      group_by(FORMATION_DIPLOME,DUREE_DISPOSITIF) %>% 
      filter(ANNEE_DISPOSITIF==min(ANNEE_DISPOSITIF)) %>% 
      distinct(FORMATION_DIPLOME,DUREE_DISPOSITIF,MEF_STAT_11),
    by=c("duree"="DUREE_DISPOSITIF","code scolarité"="FORMATION_DIPLOME")
  ) %>% 
  mutate(Filiere="Scolaire") 


ideo_actions_de_formation_initiale_univers_lycee_rens <- ideo_actions_de_formation_initiale_univers_lycee_rens %>%
  left_join(
    n_mef %>%
      filter(ANNEE_DISPOSITIF==1) %>%
      select(FORMATION_DIPLOME,DUREE_DISPOSITIF,MEF_STAT_11) %>% 
      rename(MEF_STAT_11_voeux=MEF_STAT_11),
    by=c("code scolarité"="FORMATION_DIPLOME","duree"="DUREE_DISPOSITIF")
  )  %>%
  mutate(mefstat_voeux_classe=as.numeric(str_sub(MEF_STAT_11_voeux,4,4))) %>%
  group_by(`Action de Formation (AF) identifiant Onisep`) %>%
  filter(mefstat_voeux_classe==min(mefstat_voeux_classe)) %>% 
  ungroup() %>%
  select(-mefstat_voeux_classe,-duree) %>%
  ungroup() 


ideo_actions_de_formation_initiale_univers_lycee_simpli <- ideo_actions_de_formation_initiale_univers_lycee_rens %>% 
  filter(!is.na(MEF_STAT_11)) %>% 
  select(`ENS code UAI`,MEF_STAT_11,MEF_STAT_11_voeux,Filiere) %>% 
  setNames(c("UAI","MEFSTAT11","MEFSTAT11_voeux","Filiere")) 

 
# onisep <- read_csv2("C:/Users/arnau/d-sidd Dropbox/Arnaud milet/0_beta/1- Exposition/0- data/onisep/transfer_7425716_files_efd8604c/relations_etablissement-inserjeunes_etablissement_inserjeunes_20240507_161712.csv")
# 
# onisep_simpli <- onisep %>% 
#   filter(`Millesime stats`==2022) %>% 
#   select(`UAI Établissement IDEO`,`ID inserJeunes (CFD/MEF)`,Type) %>% 
#   setNames(c("UAI","MEFSTAT11","Filiere")) %>% 
#   mutate(Filiere=ifelse(Filiere=="app","Apprentissage","Scolaire"))


rmarkdown::render("stats_catalogue_generique.Rmd", 
                  params = list(
                    catalogue_init=ideo_actions_de_formation_initiale_univers_lycee_simpli,
                    type_source ="onisep",
                    nom_catalogue= "Onisep",
                    nom_catalogue_detail = "Catalogue Ideo action univers lycée Onisep - Juillet 2024",
                    lien_drive_catalogue ="https://drive.google.com/file/d/1B6R93mCiXRtVsN6E7goyb7GEj5oyyO5I/view?usp=drive_link"
                  ),
                  output_format = "html_document",
                  output_dir = "onisep",
                  output_file = "ideo_action_univers_lycee_07_2024.html"
)


setwd(here::here())
