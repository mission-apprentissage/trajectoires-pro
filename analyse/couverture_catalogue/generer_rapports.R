#Librairies ----
library(tidyverse)
library(readxl)
library(rmarkdown)


setwd(dirname(rstudioapi::getSourceEditorContext()$path))

#Base InserJeunes ----
rmarkdown::render("base_inserjeunes_avant_integration_sup_dans_ij.Rmd", 
                  params = list(
                    phase = "Production",
                    date_maj= "27/06/2024",
                    emplacement_data_meta_formationsStats_init = "Donnees IJ/metabase/production/FormationsStats_2024_05_23.csv"
                  ),
                  output_format = "html_document",
                  output_dir = "base_inserjeunes",
                  output_file = "base_inserjeunes_production_2024_06.html"
)

rmarkdown::render("base_inserjeunes.Rmd", 
                  params = list(
                    phase = "Recette",
                    date_maj= format(Sys.time(), '%d/%m/%Y'),
                    emplacement_data_meta_formationsStats_init = "Donnees IJ/metabase/recette/FormationsStats.csv"
                  ),
                  output_format = "html_document",
                  output_dir = "base_inserjeunes",
                  output_file = "base_inserjeunes_recette_2024_10.html"
)

chemin_racine_data <- "../../../../0- data" 
source("prepa_data_init_generique.R")

# Affelnet ----
## 20240531 - Extraction catalogue SLA 2024----
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
                    type_voeux = "affelnet",
                    nom_catalogue= "Affelnet",
                    nom_catalogue_detail = "Catalogue Affelnet 2024 V20240531_Extraction_catalogue_SLA_2024",
                    lien_drive_catalogue ="https://docs.google.com/spreadsheets/d/1i3URB63eaiQJ9UfteY4_PULom_I5f1wK/edit#gid=397487575"
                  ),
                  output_format = "html_document",
                  output_dir = "affelnet",
                  output_file = "affelnet_V20240531_Extraction_catalogue_SLA_2024.html"
)


## 20240514 - Extraction catalogue SLA 2024----

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
                    type_voeux = "affelnet",
                    nom_catalogue= "Affelnet",
                    nom_catalogue_detail = "Catalogue Affelnet 2024 V20240514_Extraction_catalogue_SLA_2024",
                    lien_drive_catalogue ="https://docs.google.com/spreadsheets/d/1X3WJAe3yy-fK5u8TvUVnbNOq67mye0D6/edit?usp=drive_link&ouid=107607241761816962784&rtpof=true&sd=true"
                  ),
                  output_format = "html_document",
                  output_dir = "affelnet",
                  output_file = "affelnet_V20240514_Extraction_catalogue_SLA_2024.html"
)

## 20240112 - Extraction catalogue SLA 2023----

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
                    type_voeux = "affelnet",
                    nom_catalogue= "Affelnet",
                    nom_catalogue_detail = "Catalogue Affelnet 2023 V20240112_Extraction_catalogue_SLA_2023",
                    lien_drive_catalogue ="https://docs.google.com/spreadsheets/d/100miT_jBPQuXo-rA0HnGWX0v2W84Po9m/edit?usp=drive_link&ouid=107607241761816962784&rtpof=true&sd=true"
                  ),
                  output_format = "html_document",
                  output_dir = "affelnet",
                  output_file = "affelnet_V20240112_Extraction_catalogue_SLA_2023.html"
)


# onisep 05_2024----

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
                    type_voeux = "affelnet",
                    nom_catalogue= "Onisep",
                    nom_catalogue_detail = "Catalogue Ideo action univers lycée Onisep - Juillet 2024",
                    lien_drive_catalogue ="https://drive.google.com/file/d/1B6R93mCiXRtVsN6E7goyb7GEj5oyyO5I/view?usp=drive_link"
                  ),
                  output_format = "html_document",
                  output_dir = "onisep",
                  output_file = "ideo_action_univers_lycee_07_2024.html"
)




# Parcoursup ----
## Parcoursup 07_2024----

parcoursup_2024 <- read_excel(file.path(chemin_racine_data,"parcoursup/2024/listesFormationsInsertJeunes_toutesFormations_020224.xls"))


### Parcoursup dans InserJeunes ----

parcoursup_2024_ij <- parcoursup_2024 %>% 
  filter(FORMATION_PARAMÉTRÉE=="Paramétrée") %>% 
  rowwise() %>% 
  filter(!any(is.na(CODECFD),is.na(CODEMEF))) %>% 
  ungroup() %>% 
  select(contains("UAI"),CODEFORMATION,LIBFORMATION,CODECFD,CODEMEF,APPRENTISSAGEOUSCOLAIRE,CODEFORMATIONACCUEIL) %>% 
  left_join(
    n_mef %>% 
      select(MEF,MEF_STAT_11),
    by=c("CODEMEF"="MEF")
  ) %>% 
  mutate(CODESISE=NA)

parcoursup_2024_ij_simpli <- parcoursup_2024_ij %>% 
  select(UAI_GES,MEF_STAT_11,APPRENTISSAGEOUSCOLAIRE,CODEFORMATIONACCUEIL) %>% 
  setNames(c("UAI","MEFSTAT11","Filiere","CODEFORMATIONACCUEIL")) 



parcoursup_2024_ij_renseigne <- expo_mef_catalogue_partenaire(catalogue_init = parcoursup_2024_ij_simpli,type_source = "affelnet")



### Parcoursup dans InserSup ----

association_CODEFORMATIONACCUEIL_sise <- read_excel(file.path(chemin_racine_data,"parcoursup/2024/association_rncp_sup.xlsx"),
                                                    sheet = "2024")

Fichier_Certif_info <- data.table::fread(file.path(chemin_racine_data,"RCO/InserJeunes/InserJeunes/Fichier Certif info.csv"),encoding = "Latin-1") 

Fichier_Certif_info_simpli <- Fichier_Certif_info %>% 
  select(code_rncp,code_sise ) %>% 
  as_tibble() %>% 
  mutate(code_sise=ifelse(code_sise=="",NA,code_sise),
         code_rncp=as.character(code_rncp)) %>% 
  filter(!is.na(code_sise),!is.na(code_rncp)) %>% 
  distinct() %>% 
  rename(CODESISE=code_sise)


parcoursup_2024_isup_avec_association_CODEFORMATIONACCUEIL_sise <- parcoursup_2024 %>% 
  filter(FORMATION_PARAMÉTRÉE=="Paramétrée") %>% 
  rowwise() %>% 
  filter(any(is.na(CODECFD),is.na(CODEMEF)),CODEFORMATIONACCUEIL%in% association_CODEFORMATIONACCUEIL_sise$CODEFORMATIONACCUEIL) %>% 
  ungroup() %>% 
  select(contains("UAI"),CODEFORMATION,LIBFORMATION,CODEFORMATIONACCUEIL) %>% 
  left_join(
    association_CODEFORMATIONACCUEIL_sise %>% 
      select(CODEFORMATIONACCUEIL,CODESISE),
    by="CODEFORMATIONACCUEIL"
  )

parcoursup_2024_isup_sans_association_CODEFORMATIONACCUEIL_sise <-parcoursup_2024 %>% 
  filter(FORMATION_PARAMÉTRÉE=="Paramétrée") %>% 
  rowwise() %>% 
  filter(any(is.na(CODECFD),is.na(CODEMEF)),!CODEFORMATIONACCUEIL%in% association_CODEFORMATIONACCUEIL_sise$CODEFORMATIONACCUEIL,!is.na(LISTE_RNCP)) %>% 
  ungroup() %>% 
  select(contains("UAI"),CODEFORMATION,LIBFORMATION,CODEFORMATIONACCUEIL,LISTE_RNCP) %>% 
  mutate(LISTE_RNCP=map(LISTE_RNCP,~tibble(RNCP=unlist(str_split(.,";"))))) %>% 
  unnest() %>% 
  left_join(
    Fichier_Certif_info_simpli,
    by=c("RNCP"="code_rncp")
  ) %>% 
  select(-RNCP,-UAI_COMPOSANTE,-UAI_AFF) %>% 
  distinct()


parcoursup_2024_isup_avec_sise <- parcoursup_2024_isup_avec_association_CODEFORMATIONACCUEIL_sise %>% 
  bind_rows(parcoursup_2024_isup_sans_association_CODEFORMATIONACCUEIL_sise ) %>% 
  mutate(filiere="superieur") %>%
  select(UAI_GES,CODESISE,LIBFORMATION,filiere,CODEFORMATIONACCUEIL) %>% 
  setNames(c("UAI","CODESISE","LIBELLE_COURT","Filiere","CODEFORMATIONACCUEIL")) 


parcoursup_2024_isup_avec_sise <- parcoursup_2024_isup_avec_sise %>% 
  bind_cols(
    map(c("MEFSTAT11", "famillemetiers", "FORMATION_DIPLOME", "NIVEAU_FORMATION_DIPLOME", 
          "NIVEAU_QUALIFICATION_RNCP", "MEFSTAT11_annee_terminale", "FORMATION_DIPLOME_annee_terminale", 
          "GROUPE_SPECIALITE", "LETTRE_SPECIALITE", "LIBELLE_LONG_200", 
          "LIBELLE_STAT_33", "filiere"),
        function(x){
          tibble(var=NA) %>% 
            setNames(x)
        }) %>% 
      reduce(bind_cols)
  )


parcoursup_2024_isup_renseigne <- expo_mef_catalogue_partenaire(catalogue_init = parcoursup_2024_isup_avec_sise,type_source = "superieur")



### Parcoursup pas dans InserJeunes et pas dans  InserSup ----
parcoursup_2024_pas_ij_pas_isup <- parcoursup_2024 %>% 
  filter(FORMATION_PARAMÉTRÉE=="Paramétrée") %>% 
  filter(!CODEFORMATIONACCUEIL %in% (parcoursup_2024_ij_renseigne %>% 
                                       select(CODEFORMATIONACCUEIL) %>% 
                                       bind_rows(
                                         parcoursup_2024_isup_renseigne %>% 
                                           select(CODEFORMATIONACCUEIL)
                                       ) %>% 
                                       pull(CODEFORMATIONACCUEIL))) %>%
  left_join(
    n_mef %>% 
      select(MEF,MEF_STAT_11),
    by=c("CODEMEF"="MEF")
  ) %>% 
  mutate(CODESISE=NA)



parcoursup_2024_pas_ij_pas_isup_simpli <- parcoursup_2024_pas_ij_pas_isup %>% 
  select(UAI_GES,MEF_STAT_11,APPRENTISSAGEOUSCOLAIRE,CODEFORMATIONACCUEIL) %>% 
  setNames(c("UAI","MEFSTAT11","Filiere","CODEFORMATIONACCUEIL")) 


parcoursup_2024_pas_ij_pas_isup_renseigne <- expo_mef_catalogue_partenaire(catalogue_init = parcoursup_2024_pas_ij_pas_isup_simpli,type_source = "affelnet")





parcoursup_2024_renseigne <- parcoursup_2024_pas_ij_pas_isup_renseigne %>% 
  mutate(type="pas_isup_pas_ij") %>% 
  bind_rows(
    parcoursup_2024_ij_renseigne %>% 
      mutate(type="ij")
  ) %>% 
  bind_rows(
    parcoursup_2024_isup_renseigne %>% 
      mutate(type="isup")
  )


#Pour afficher les stats sur les données transmises en février 2024
listeFormationsInserJeunes_2024_ensemble_bdd_parametrees_completees_a_transmettre_ps <- read_excel("C:/Users/arnau/d-sidd Dropbox/Arnaud milet/0_beta/1- Exposition/Groupe-002 - Parcoursup/002 - 2 - Parcoursup/2024/a transmettre/listeFormationsInserJeunes_2024_ensemble_bdd_parametrees_completees_a_transmettre_ps.xlsx")

parcoursup_2024_renseigne <- parcoursup_2024_renseigne %>% 
  select(-Couverture) %>% 
  left_join(
    listeFormationsInserJeunes_2024_ensemble_bdd_parametrees_completees_a_transmettre_ps %>% 
      mutate(Couverture=case_when(
        !is.na(taux_en_emploi_6_mois)~"Couvert",
        nb_annee_term<20~"Sous le seuil de 20 élèves",
        T~"Non couvert"
      )) %>% 
      select(CODEFORMATIONACCUEIL,Couverture),
    by="CODEFORMATIONACCUEIL"
  )


parcoursup_2024_renseigne <- parcoursup_2024_renseigne  %>% 
  left_join(
    parcoursup_2024  %>% 
      mutate(LIBFORMATION=str_split_fixed(LIBFORMATION," - ",n=2)[,1]) %>% 
      select(CODEFORMATIONACCUEIL,LIBFORMATION,APPRENTISSAGEOUSCOLAIRE),
    by="CODEFORMATIONACCUEIL"
  ) %>% 
  mutate(
    libelle_type_diplome=case_when(
      libelle_type_diplome %in% c("Inconnu","Autres diplômes") & LIBFORMATION %in% c("Licence", "BUT", "Certificat de Spécialisation", "Formations  des écoles d'ingénieurs", 
                                                                                     "D.E secteur sanitaire", "BTS", "D.E secteur social", "Formation des écoles de commerce et de management", 
                                                                                     "BPJEPS") ~ LIBFORMATION,
      libelle_type_diplome %in% c("Inconnu","Autres diplômes") ~ "Autres diplômes",
      T~libelle_type_diplome 
    ),
    Filiere=APPRENTISSAGEOUSCOLAIRE
  ) %>% 
  select(-LIBFORMATION,-APPRENTISSAGEOUSCOLAIRE)

parcoursup_2024_renseigne <- parcoursup_2024_renseigne %>% 
  mutate(type_formation="Après le bac")


rmarkdown::render("stats_catalogue_generique.Rmd", 
                  params = list(
                    catalogue_init=NULL,
                    type_source = NULL,
                    type_voeux= "parcoursup",
                    nom_catalogue= "Parcoursup",
                    afficher_stats_voeux=FALSE,
                    catalogue_renseigne=parcoursup_2024_renseigne,
                    nom_catalogue_detail = "Parcoursup - Juillet 2024",
                    lien_drive_catalogue ="https://docs.google.com/spreadsheets/d/1ShIzmTuVb7ZRBqXMlskqrx8OQVSB7N1i/edit?usp=drive_link&ouid=107607241761816962784&rtpof=true&sd=true"
                  ),
                  output_format = "html_document",
                  output_dir = "parcoursup",
                  output_file = "parcoursup_07_2024.html"
)

## Parcoursup 10_2024----

source("parcoursup/script_prepa_ps_2025.R")

rmarkdown::render("stats_catalogue_generique.Rmd", 
                  params = list(
                    catalogue_init=NULL,
                    type_source = NULL,
                    type_voeux= "parcoursup",
                    nom_catalogue= "Parcoursup",
                    afficher_stats_voeux=TRUE,
                    stats_catalogue=stats_catalogue_parcoursup_2024_10,
                    nom_catalogue_detail = "Parcoursup - Octobre 2024",
                    lien_drive_catalogue ="https://docs.google.com/spreadsheets/d/1ShIzmTuVb7ZRBqXMlskqrx8OQVSB7N1i/edit?usp=drive_link&ouid=107607241761816962784&rtpof=true&sd=true"
                  ),
                  output_format = "html_document",
                  output_dir = "parcoursup",
                  output_file = "parcoursup_10_2024.html"
)



## Parcoursup agregation 02_2024_ET_10_2024----

source("parcoursup/script_prepa_ps_2025_agreagation_02_2024_ET_10_2024.R")

rmarkdown::render("stats_catalogue_generique.Rmd", 
                  params = list(
                    catalogue_init=NULL,
                    type_source = NULL,
                    type_voeux= "parcoursup",
                    nom_catalogue= "Parcoursup",
                    afficher_stats_voeux=TRUE,
                    stats_catalogue=stats_catalogue_parcoursup_2024_agregation_10_2024_02,
                    nom_catalogue_detail = "Parcoursup - Agrégation des catalogues Février et Octobre 2024",
                    lien_drive_catalogue ="https://docs.google.com/spreadsheets/d/1ShIzmTuVb7ZRBqXMlskqrx8OQVSB7N1i/edit?usp=drive_link&ouid=107607241761816962784&rtpof=true&sd=true"
                  ),
                  output_format = "html_document",
                  output_dir = "parcoursup",
                  output_file = "parcoursup_agregation_02_2024_ET_10_2024.html"
)


# Catalogue apprentissage  ----

formation_catalogue_apprentissage <- data.table::fread(file.path(chemin_racine_data,"RCO/formation_2024-05-02T07 56 05.492Z.csv")) %>% 
  as_tibble()

formation_catalogue_apprentissage <- formation_catalogue_apprentissage %>%
  mutate_all(str_remove_all,"=\"") %>%
  mutate_all(str_remove_all,"\"")

formation_catalogue_apprentissage_simpli <-formation_catalogue_apprentissage %>%
  mutate(UAI=case_when(
    `Formateur: UAI`!="" ~ `Formateur: UAI`,
    `Lieu: UAI`!=""~`Lieu: UAI`,
    `Responsable: UAI`!=`Responsable: UAI` ~`Responsable: UAI`
  )) %>% 
  select(UAI,`Formation: code CFD`,`Formation: durée collectée`,`Identifiant Parcoursup`) %>% 
  setNames(c("UAI","CFD","duree","CODEFORMATIONACCUEIL")) %>% 
  mutate(Filiere="Apprentissage",
         duree=as.numeric(duree),
         code_temp=1:nrow(.)) %>% 
  left_join(
    n_mef %>% 
      filter(DUREE_DISPOSITIF==ANNEE_DISPOSITIF) %>% 
      distinct(FORMATION_DIPLOME,DUREE_DISPOSITIF,MEF_STAT_11) %>% 
      mutate(
        ANNEE_DISPOSITIF=as.numeric(str_sub(MEF_STAT_11,4,4))
      ) %>% 
      group_by(FORMATION_DIPLOME,DUREE_DISPOSITIF) %>% 
      filter(ANNEE_DISPOSITIF==min(ANNEE_DISPOSITIF)) %>% 
      distinct(FORMATION_DIPLOME,DUREE_DISPOSITIF,MEF_STAT_11) %>% 
      rename(MEF_STAT_11_recherche_1=MEF_STAT_11),
    by=c("duree"="DUREE_DISPOSITIF","CFD"="FORMATION_DIPLOME")
  ) %>% 
  left_join(
    n_mef %>% 
      filter(DUREE_DISPOSITIF==ANNEE_DISPOSITIF) %>% 
      distinct(FORMATION_DIPLOME,DUREE_DISPOSITIF,MEF_STAT_11,STATUT_MEF) %>% 
      mutate(
        ANNEE_DISPOSITIF=as.numeric(str_sub(MEF_STAT_11,4,4))
      ) %>% 
      group_by(FORMATION_DIPLOME,DUREE_DISPOSITIF) %>% 
      filter(ANNEE_DISPOSITIF==min(ANNEE_DISPOSITIF)) %>% 
      group_by(FORMATION_DIPLOME) %>% 
      filter(STATUT_MEF==max(STATUT_MEF)) %>% 
      filter(ANNEE_DISPOSITIF==min(ANNEE_DISPOSITIF)) %>% 
      distinct(FORMATION_DIPLOME,DUREE_DISPOSITIF,MEF_STAT_11) %>%
      rename(MEF_STAT_11_recherche_2=MEF_STAT_11),
    by=c("CFD"="FORMATION_DIPLOME")
  ) %>% 
  mutate(MEFSTAT11=ifelse(is.na(MEF_STAT_11_recherche_1),MEF_STAT_11_recherche_2,MEF_STAT_11_recherche_1),
         CODEFORMATIONACCUEIL=as.numeric(CODEFORMATIONACCUEIL)) %>% 
  select(UAI,CFD,Filiere,MEFSTAT11,CODEFORMATIONACCUEIL)


# formation_catalogue_apprentissage_simpli <- formation_catalogue_apprentissage %>% 
#   select(`UAI formateur`,`Code du diplome ou du titre suivant la nomenclature de l'Education nationale (CodeEN)`,Duree,`parcoursup_id (g_ta_cod)`) %>% 
#   setNames(c("UAI","CFD","duree","CODEFORMATIONACCUEIL")) %>% 
#   mutate(Filiere="Apprentissage",
#          duree=as.numeric(duree),
#          code_temp=1:nrow(.)) %>% 
#   left_join(
#     n_mef %>% 
#       filter(DUREE_DISPOSITIF==ANNEE_DISPOSITIF) %>% 
#       distinct(FORMATION_DIPLOME,DUREE_DISPOSITIF,MEF_STAT_11) %>% 
#       mutate(
#         ANNEE_DISPOSITIF=as.numeric(str_sub(MEF_STAT_11,4,4))
#       ) %>% 
#       group_by(FORMATION_DIPLOME,DUREE_DISPOSITIF) %>% 
#       filter(ANNEE_DISPOSITIF==min(ANNEE_DISPOSITIF)) %>% 
#       distinct(FORMATION_DIPLOME,DUREE_DISPOSITIF,MEF_STAT_11) %>% 
#       rename(MEF_STAT_11_recherche_1=MEF_STAT_11),
#     by=c("duree"="DUREE_DISPOSITIF","CFD"="FORMATION_DIPLOME")
#   ) %>% 
#   left_join(
#     n_mef %>% 
#       filter(DUREE_DISPOSITIF==ANNEE_DISPOSITIF) %>% 
#       distinct(FORMATION_DIPLOME,DUREE_DISPOSITIF,MEF_STAT_11,STATUT_MEF) %>% 
#       mutate(
#         ANNEE_DISPOSITIF=as.numeric(str_sub(MEF_STAT_11,4,4))
#       ) %>% 
#       group_by(FORMATION_DIPLOME,DUREE_DISPOSITIF) %>% 
#       filter(ANNEE_DISPOSITIF==min(ANNEE_DISPOSITIF)) %>% 
#       group_by(FORMATION_DIPLOME) %>% 
#       filter(STATUT_MEF==max(STATUT_MEF)) %>% 
#       filter(ANNEE_DISPOSITIF==min(ANNEE_DISPOSITIF)) %>% 
#       distinct(FORMATION_DIPLOME,DUREE_DISPOSITIF,MEF_STAT_11) %>%
#       rename(MEF_STAT_11_recherche_2=MEF_STAT_11),
#     by=c("CFD"="FORMATION_DIPLOME")
#   ) %>% 
#   mutate(MEFSTAT11=ifelse(is.na(MEF_STAT_11_recherche_1),MEF_STAT_11_recherche_2,MEF_STAT_11_recherche_1),
#          CODEFORMATIONACCUEIL=as.numeric(CODEFORMATIONACCUEIL)) %>% 
#   select(UAI,CFD,Filiere,MEFSTAT11,CODEFORMATIONACCUEIL)



formation_catalogue_apprentissage_renseigne <- expo_mef_catalogue_partenaire(catalogue_init = formation_catalogue_apprentissage_simpli,type_source = "affelnet")


stats_catalogue_apprentissage_ij <- expo_mef_stats_catalogue_partenaire(catalogue_partenaire_renseigne = formation_catalogue_apprentissage_renseigne %>% 
                                                                          filter(as.numeric(str_sub(NIVEAU_FORMATION_DIPLOME,1,1))>3 |is.na(NIVEAU_FORMATION_DIPLOME)) %>% 
                                                                          select(-CODEFORMATIONACCUEIL))


stats_catalogue_apprentissage_isup <- expo_mef_stats_catalogue_partenaire(catalogue_partenaire_renseigne = formation_catalogue_apprentissage_renseigne %>% 
                                                                            filter(as.numeric(str_sub(NIVEAU_FORMATION_DIPLOME,1,1))<=3),
                                                                          type_voeux = "parcoursup")

stats_catalogue_apprentissage <- NULL

stats_catalogue_apprentissage$stats_catalogue_partenaire <- stats_catalogue_apprentissage_ij$stats_catalogue_partenaire %>% 
  filter(`Type diplôme`!="Total") %>% 
  mutate(`Avant/après bac`="Avant") %>% 
  bind_rows(
    stats_catalogue_apprentissage_isup$stats_catalogue_partenaire %>% 
      filter(`Type diplôme`!="Total")%>% 
      mutate(`Avant/après bac`="Après")    
  ) %>% 
  mutate(`Part du  catalogue`=prop.table(`Nombre de formations`)) %>% 
  bind_rows(
    stats_catalogue_apprentissage_ij$stats_catalogue_partenaire %>% 
      filter(`Type diplôme`=="Total")%>% 
      mutate(`Avant/après bac`="Total",
             Filiere="Total") %>% 
      bind_rows(
        stats_catalogue_apprentissage_isup$stats_catalogue_partenaire %>% 
          filter(`Type diplôme`=="Total")%>% 
          mutate(`Avant/après bac`="Total",
                 Filiere="Total")    
      ) %>% 
      group_by(`Avant/après bac`,`Type diplôme`, Filiere ) %>% 
      summarise_all(sum,na.rm=T)%>% 
      select(-contains("(%)")) %>%
      mutate_at(vars(contains("(nb)")),.funs = list(pct=~./`Nombre de formations`))  %>% 
      setNames(str_replace(names(.),pattern = "\\(nb\\)_pct",replacement = "(%)")) %>% 
      mutate(`Part du  catalogue`=1)
  )




stats_catalogue_apprentissage$stats_catalogue_partenaire_voeux <- stats_catalogue_apprentissage_ij$stats_catalogue_partenaire_voeux %>% 
  filter(`Type diplôme`!="Total") %>% 
  mutate(`Avant/après bac`="Avant") %>% 
  bind_rows(
    stats_catalogue_apprentissage_isup$stats_catalogue_partenaire_voeux %>% 
      filter(`Type diplôme`!="Total")%>% 
      mutate(`Avant/après bac`="Après")    
  )  %>% 
  mutate(`Part du  catalogue`=prop.table(`Demandes tous voeux`)) %>% 
  bind_rows(
    stats_catalogue_apprentissage_ij$stats_catalogue_partenaire_voeux %>% 
      filter(`Type diplôme`=="Total")%>% 
      mutate(`Avant/après bac`="Total",
             Filiere="Total") %>% 
      bind_rows(
        stats_catalogue_apprentissage_isup$stats_catalogue_partenaire_voeux %>% 
          filter(`Type diplôme`=="Total")%>% 
          mutate(`Avant/après bac`="Total",
                 Filiere="Total")    
      ) %>% 
      group_by(`Avant/après bac`,`Type diplôme`, Filiere ) %>% 
      summarise_all(sum,na.rm=T)%>% 
      select(-contains("(%)")) %>%
      mutate_at(vars(contains("(nb)")),.funs = list(pct=~./`Demandes tous voeux`))  %>% 
      setNames(str_replace(names(.),pattern = "\\(nb\\)_pct",replacement = "(%)")) %>% 
      mutate(`Part du  catalogue`=1)
  )




rmarkdown::render("stats_catalogue_generique.Rmd", 
                  params = list(
                    catalogue_init=NULL,
                    type_source = NULL,
                    type_voeux= NULL,
                    afficher_stats_voeux=FALSE,
                    nom_catalogue= "Catalogue des formations en apprentissage",
                    stats_catalogue=stats_catalogue_apprentissage,
                    nom_catalogue_detail = "Catalogue des formations en apprentissage - Juillet 2024",
                    lien_drive_catalogue ="https://drive.google.com/drive/folders/1munUNzXQ4hZBIOWCGlDkzYuw_ku6Sqxj?usp=sharing"
                  ),
                  output_format = "html_document",
                  output_dir = "catalogue_formations_apprentissage",
                  output_file = "catalogue_formations_apprentissage_07_2024.html"
)



setwd(here::here())



