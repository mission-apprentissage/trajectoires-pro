# Chargement des librairies ----
library(tidyverse)
library(readxl)
library(jsonlite)
library(knitr)
library(kableExtra)
library(DT)

# chemin_racine_data <- "../../0- data"

# Données ----

## Données BCN ----
n_mef <- read_csv2(file.path(chemin_racine_data,"n_mef_.csv"))
n_formation_diplome <- read_delim(file.path(chemin_racine_data,"BCN/n_formation_diplome_.csv"),delim = ";", escape_double = FALSE, trim_ws = TRUE)
n_niveau_formation_diplome <- read_csv2(file.path(chemin_racine_data,"BCN/n_niveau_formation_diplome_.csv"))

## CertifInfos

opendata_certifinfo <- data.table::fread(file.path(chemin_racine_data,"Certif_Infos/opendata-certifinfo-01072024.csv"),
                                         encoding ="Latin-1" )

inserJeune_sise_rncp <- read_csv2(file.path(chemin_racine_data,"RCO/2024_09_12/inserJeune-sise-rncp.csv"), 
                                  skip = 1)

inserJeune_certifinfo <- read_csv2(file.path(chemin_racine_data,"RCO/2024_09_12/inserJeune-certifinfo.csv"), 
                                   skip = 1)


inserJeune_certifinfo_correspondance <- inserJeune_certifinfo %>%
  select(`Code Certifinfo`,`Intitule Certifinfo`,`Code RNCP`,`Code Onisep`,`Code Onisep Ideo`,`Code Sise`,`Code Sise`,`Code scolarité`) %>% 
  left_join(
    opendata_certifinfo %>% 
      select(Code_Diplome,Libelle_Type_Diplome,Libelle_Type_Diplome,Code_Niveau_Europeen),
    by=c("Code Certifinfo"="Code_Diplome")
  )

table_de_passage_codes_certifications_et_formations <- read_delim(file.path(chemin_racine_data,"onisep/table_de_passage_codes_certifications_et_formations.csv"), 
                                                                  delim = ";", escape_double = FALSE, trim_ws = TRUE)

## ACCE

ACCE_UAI <- data.table::fread(file.path(chemin_racine_data,"ACCE/Extraction ACCE 11-07-2023/ACCE_UAI.csv"),
                              encoding = "Latin-1") %>% 
  mutate(academie=str_pad(academie,side = "left",pad="0",width=2))

## Effectifs ----
fr_en_lycee_pro_effectifs_niveau_sexe_mef <- read_csv2(file.path(chemin_racine_data,"SSM/depp/2023/fr-en-lycee_pro-effectifs-niveau-sexe-mef.csv"))

fr_esr_principaux_diplomes_et_formations_prepares_etablissements_publics <- data.table::fread(file.path(chemin_racine_data,"SSM/SIES/2023/fr-esr-principaux-diplomes-et-formations-prepares-etablissements-publics.csv")) %>% 
  as_tibble()


effectifs_rentree_simpli <- fr_en_lycee_pro_effectifs_niveau_sexe_mef %>% 
  filter(`Rentrée scolaire`==2023) %>% 
  select(UAI,`Mef Bcp 11`,`Nombre d'élèves : Total`) %>% 
  setNames(c("UAI","code_certification","effectif_rentree")) %>% 
  mutate(Filiere="Scolaire") %>% 
  bind_rows(
    fr_esr_principaux_diplomes_et_formations_prepares_etablissements_publics %>% 
      filter(`Rentrée universitaire`==2022) %>% 
      select(`Identifiant(s) UAI`,DIPLOM,DEGETU,`Nombre d'étudiants inscrits (inscriptions principales) y compris doubles inscriptions CPGE`) %>% 
      group_by(`Identifiant(s) UAI`,DIPLOM) %>% 
      filter(DEGETU==max(DEGETU)) %>% 
      select(-DEGETU) %>% 
      setNames(c("UAI","code_certification","effectif_rentree")) %>% 
      mutate(Filiere="superieur")
  )

## Voeux plateformes d' affectation ----

voeux_affelnet <- data.table::fread(file.path(chemin_racine_data,"affelnet/2023/attractivite_capacite_2023.csv"),encoding = "Latin-1")

# Demandes tous vœux
# Nombre de voeux affectes

voeux_affelnet_simpli <- voeux_affelnet %>% 
  as_tibble() %>% 
  left_join(
    n_mef %>% 
      select(MEF_STAT_11,FORMATION_DIPLOME),
    by=c("MEF STAT 11"="MEF_STAT_11")
  ) %>% 
  group_by(`Etablissement d'accueil`,`MEF STAT 11`,`Statut Offre de formation`,FORMATION_DIPLOME) %>% 
  summarise(`Nombre de voeux affectes`=sum(`Affectés tous vœux`,na.rm = T),
            `Demandes tous vœux`=sum(`Demandes tous vœux`,na.rm=T)) %>%  
  ungroup() %>% 
  setNames(c("UAI","MEFSTAT11","Filiere","FORMATION_DIPLOME","Nombre de voeux affectes","Demandes tous voeux")) %>% 
  filter(MEFSTAT11!="") %>% 
  mutate(Filiere=ifelse(Filiere=="ST","Scolaire","Apprentissage"))


voeux_parcoursup <- data.table::fread(file.path(chemin_racine_data,"SSM/SIES/2023/fr-esr-parcoursup.csv"))

catalogue_parcoursup_2023 <- read_excel(file.path(chemin_racine_data,"parcoursup/2023/listeFormationsInserJeunes_finSession2023_avecNbDemandeEnPlus.xls"))
catalogue_parcoursup_2024 <- read_excel(file.path(chemin_racine_data,"parcoursup/2024/listesFormationsInsertJeunes_toutesFormations_020224.xls"))
#voe_tot
#acc_tot

voeux_parcoursup_simpli <- voeux_parcoursup %>% 
  as_tibble() %>% 
  filter(session==2023) %>% 
  select(cod_uai,voe_tot,acc_tot,cod_aff_form,lien_form_psup,lib_for_voe_ins) %>% 
  left_join(
    catalogue_parcoursup_2024 %>% 
      select(contains("uai"),CODEFORMATION,LIBFORMATION,CODEMEF,CODECFD,CODEFORMATIONINSCRIPTION,CODEFORMATIONACCUEIL,APPRENTISSAGEOUSCOLAIRE,ID_RCO),
    by=c("cod_aff_form"="CODEFORMATIONACCUEIL")
  ) %>% 
  select(cod_uai,voe_tot,acc_tot,cod_aff_form,lien_form_psup,lib_for_voe_ins,CODEMEF,CODECFD,APPRENTISSAGEOUSCOLAIRE,ID_RCO) %>% 
  filter(!is.na(APPRENTISSAGEOUSCOLAIRE)) %>% 
  bind_rows(
    voeux_parcoursup %>% 
      as_tibble() %>% 
      filter(session==2023) %>% 
      select(cod_uai,voe_tot,acc_tot,cod_aff_form,lien_form_psup,lib_for_voe_ins) %>% 
      left_join(
        catalogue_parcoursup_2024 %>% 
          select(contains("uai"),CODEFORMATION,LIBFORMATION,CODEMEF,CODECFD,CODEFORMATIONINSCRIPTION,CODEFORMATIONACCUEIL,APPRENTISSAGEOUSCOLAIRE,ID_RCO),
        by=c("cod_aff_form"="CODEFORMATIONACCUEIL")
      ) %>% 
      select(cod_uai,voe_tot,acc_tot,cod_aff_form,lien_form_psup,lib_for_voe_ins,CODEMEF,CODECFD,APPRENTISSAGEOUSCOLAIRE,ID_RCO) %>% 
      filter(is.na(APPRENTISSAGEOUSCOLAIRE)) %>% 
      select(cod_uai,voe_tot,acc_tot,cod_aff_form,lien_form_psup,lib_for_voe_ins) %>% 
      left_join(
        catalogue_parcoursup_2023 %>% 
          select(contains("uai"),CODEFORMATION,LIBFORMATION,CODEMEF,CODECFD,CODEFORMATIONINSCRIPTION,CODEFORMATIONACCUEIL,APPRENTISSAGEOUSCOLAIRE,ID_RCO),
        by=c("cod_aff_form"="CODEFORMATIONACCUEIL")
      )   
  ) %>% 
  distinct(cod_uai,cod_aff_form,CODEMEF,APPRENTISSAGEOUSCOLAIRE,CODECFD,acc_tot,voe_tot) %>% 
  setNames(c("UAI","CODEFORMATIONACCUEIL","MEF","Filiere","FORMATION_DIPLOME","Nombre de voeux affectes","Demandes tous voeux")) %>%
  left_join(
    n_mef %>% 
      select(MEF,MEF_STAT_11) %>% 
      rename(MEFSTAT11=MEF_STAT_11),
    by="MEF"
  ) %>% 
  select(-MEF)


voeux_parcoursup_affelnet_simpli_2023 <- voeux_parcoursup_simpli %>% 
  mutate(catalogue_voeux="parcoursup") %>% 
  bind_rows(voeux_affelnet_simpli %>% 
              mutate(catalogue_voeux="affelnet")
  ) %>% 
  mutate(code_certification=ifelse(Filiere=="Scolaire",MEFSTAT11,FORMATION_DIPLOME)) %>% 
  distinct(UAI,CODEFORMATIONACCUEIL,code_certification,Filiere,catalogue_voeux,`Nombre de voeux affectes`,`Demandes tous voeux`) 




## Données IJ pour analyse de la couverture ----
### Etablissements ----
data_meta_formationsStats_init <- read_csv(file.path(chemin_racine_data,"Donnees IJ/metabase/production/FormationsStats.csv"))

data_meta_formationsStats_init <- data_meta_formationsStats_init %>%
  setNames(names(.) %>%
             str_to_lower() %>%
             str_replace_all(" ", "_"))

data_meta_formationsStats_init <- data_meta_formationsStats_init %>%
  bind_cols(  str_split_fixed(
    data_meta_formationsStats_init$donnee_source,
    pattern = ",",
    n = 2
  ) %>%
    as_tibble() %>%
    mutate(
      V1 = str_remove(V1, "\\{:code_certification "),
      V2 = str_remove(V2, " :type "),
      V2 = str_remove(V2, "\\}")
    ) %>%  
    setNames(c(
      "code_certification_source", "type_source"
    ))) %>%
  bind_cols(
    str_split_fixed(
      data_meta_formationsStats_init$diplome,
      pattern = ",",
      n = 2
    )%>%
      as_tibble() %>%
      mutate(
        V1 = str_remove(V1, "\\{:code "),
        # V1 = str_remove(V1, "\""),
        V2 = str_remove(V2, " :libelle "),
        V2 = str_remove(V2, "\\}")
      ) %>%
      setNames(c(
        "niveau_diplome", "libelle_type_diplome"
      ))
  ) %>%
  mutate(
    "Couverture Taux En Emploi 6 Mois" = ifelse(is.na(taux_en_emploi_6_mois), F, T),
    "Couverture Taux Autres 6 Mois" = ifelse(is.na(taux_autres_6_mois), F, T),
    "Couverture Taux En poursuite" = ifelse(is.na(taux_en_formation), F, T)
  ) %>%
  distinct(
    code_certification ,
    code_formation_diplome,
    uai,
    uai_donnee_type,
    type_source,
    filiere,
    millesime,
    niveau_diplome,
    libelle_type_diplome,
    nb_annee_term,
    nb_en_emploi_6_mois,
    nb_poursuite_etudes,
    taux_en_emploi_6_mois,
    taux_autres_6_mois,
    taux_en_formation,
    `Couverture Taux En Emploi 6 Mois`,
    `Couverture Taux Autres 6 Mois`,
    `Couverture Taux En poursuite`
  ) %>%
  mutate(presence_ij = T,
         Avant_apres_continuum = case_when(
           nb_annee_term < 20 ~ "Sous le seuil de 20 élèves",
           type_source %in% c("self","nouvelle") ~ "Avant continuum",
           type_source == "ancienne" ~ "Apres continuum"
         ),
         millesime=str_sub(millesime,-4),
         Couverture=case_when(
           !(`Couverture Taux En Emploi 6 Mois` & `Couverture Taux Autres 6 Mois` & `Couverture Taux En poursuite`)  ~ "Non couvert",
           (`Couverture Taux En Emploi 6 Mois` & `Couverture Taux Autres 6 Mois` & `Couverture Taux En poursuite`)& Avant_apres_continuum!="Sous le seuil de 20 élèves"  ~ "Couvert",
           millesime == max(millesime) & str_detect(Avant_apres_continuum, "continuum") ~ "Couvert",
           Avant_apres_continuum =="Avant continuum" ~ "Couvert",
           Avant_apres_continuum =="Apres continuum" ~ "Non couvert",
           T~Avant_apres_continuum
         )
  )  %>%
  left_join(n_formation_diplome %>%
              select(FORMATION_DIPLOME,NIVEAU_FORMATION_DIPLOME),
            by=c("code_formation_diplome" ="FORMATION_DIPLOME")
  ) %>%
  left_join(
    n_niveau_formation_diplome %>%
      select(NIVEAU_FORMATION_DIPLOME,NIVEAU_QUALIFICATION_RNCP),
    by="NIVEAU_FORMATION_DIPLOME"
  ) %>%
  mutate(id_unique=1:n())


formation_catalogue_apprentissage <- data.table::fread(file.path(chemin_racine_data,"RCO/formation_2024-01-11T11 35 57.905Z.csv")) %>% 
  as_tibble()

formation_catalogue_apprentissage <- formation_catalogue_apprentissage %>%
  mutate_all(str_remove_all,"=\"") %>%
  mutate_all(str_remove_all,"\"")


formation_catalogue_apprentissage_long <- formation_catalogue_apprentissage %>%
  # filter(`Statut Affelnet`!="non publiable en l'etat") %>%
  distinct(`UAI Responsable`,`UAI formation`,`UAI formateur`,`Code du diplome ou du titre suivant la nomenclature de l'Education nationale (CodeEN)`,`Clé ministere educatif`) %>%
  pivot_longer(cols = contains("Uai"),names_to = "Type UAI",values_to = "UAI",values_drop_na = TRUE)


formation_catalogue_apprentissage_long_comp <- formation_catalogue_apprentissage_long %>%
  left_join(
    data_meta_formationsStats_init %>%
      filter(
        filiere == "apprentissage",
        millesime == "2022"
      ),
    by=c("UAI"="uai","Code du diplome ou du titre suivant la nomenclature de l'Education nationale (CodeEN)"="code_certification")
  ) %>%
  filter(!is.na(type_source))

formation_catalogue_apprentissage_long_comp <- formation_catalogue_apprentissage_long_comp %>%
  mutate(`Type UAI`=factor(`Type UAI`,levels=c("UAI formation","UAI formateur","UAI Responsable"))) %>%
  group_by(UAI,`Code du diplome ou du titre suivant la nomenclature de l'Education nationale (CodeEN)`) %>%
  filter(as.numeric(`Type UAI`)==min(as.numeric(`Type UAI`))) %>%
  ungroup() %>%
  rename(code_certification=`Code du diplome ou du titre suivant la nomenclature de l'Education nationale (CodeEN)`)


ensemble_data_formationsStats <-  formation_catalogue_apprentissage_long_comp %>%
  bind_rows(
    data_meta_formationsStats_init %>%
      filter(
        filiere == "pro",
        millesime == "2022"
      ) %>%
      rename(UAI=uai)
  ) %>% 
  bind_rows(
    data_meta_formationsStats_init %>%
      filter(
        filiere == "superieur",
        millesime == "2021"
      ) %>%
      rename(UAI=uai)
  )


### Insersup ----
fr_esr_insersup <- read_excel(file.path(chemin_racine_data,"SSM/SIES/2023/insersup/fr-esr-insersup.xlsx"))

# Base InserJeunes ----

stats_InserJeunes <- data_meta_formationsStats_init %>% 
  filter(type_source%in%c("self","ancienne"),millesime==2022) %>%
  mutate(
    type_formation=case_when(
      as.numeric(NIVEAU_QUALIFICATION_RNCP)%in%0:4 ~ "Avant le bac",
      as.numeric(NIVEAU_QUALIFICATION_RNCP)%in%5:8 ~ "Après le bac",
      
      niveau_diplome%in%0:4 ~ "Avant le bac",
      niveau_diplome%in%5:8 ~ "Après le bac"
      
    ),
    type_formation=factor(type_formation,levels=c("Avant le bac","Après le bac")),
    libelle_type_diplome=case_when(
      str_detect(libelle_type_diplome,"DIP3-CNAM")~"Titre professionnel homologué",
      str_detect(libelle_type_diplome,"TH3")~"Titre professionnel homologué",
      str_detect(libelle_type_diplome,"TH4")~"Titre professionnel homologué",
      str_detect(libelle_type_diplome,"TH5")~"Titre professionnel homologué",
      str_detect(libelle_type_diplome,"DIV-2")~"Autres diplômes",
      str_detect(libelle_type_diplome,"DIV-3")~"Autres diplômes",
      str_detect(libelle_type_diplome,"DIV-4")~"Autres diplômes",
      str_detect(libelle_type_diplome,"DIV-5")~"Autres diplômes",
      str_detect(libelle_type_diplome,"BPA")~"BPA",
      str_detect(libelle_type_diplome,"CSA")~"CSA",
      str_detect(libelle_type_diplome,"CS")~"CS",
      str_detect(libelle_type_diplome,"ASSIMI.BTS")~"BTS",
      
      T~libelle_type_diplome
    ),
    filiere=ifelse(filiere=="pro","Scolaire",filiere)
  )  %>% 
  filter(libelle_type_diplome!="Autres diplômes") %>% 
  group_by(type_formation,libelle_type_diplome,filiere) %>% 
  summarise(presence=n())  %>% 
  mutate(filiere=str_to_title(filiere)) %>% 
  pivot_wider(names_from = filiere,values_from = presence) %>% 
  mutate_all(replace_na,0) %>%   
  rename(
    "Avant/après bac"=type_formation,
    "Type diplôme"=libelle_type_diplome
  ) %>% 
  ungroup() %>% 
  mutate(
    Volume=Scolaire + Apprentissage,
    "Part base"=prop.table(Volume),
    Base="InserJeunes"
  ) 


# Base InserSup ----

stats_Insersup <- fr_esr_insersup %>% 
  filter(str_detect(`Année(s) d'obtention du diplôme prise(s) en compte`,"2021"),`Code UAI de l'établissement`!="UNIV",`Code du diplôme SISE`!="all") %>% 
  distinct(type_diplome,`Code du diplôme SISE`,`Code UAI de l'établissement`) %>% 
  mutate(`Avant/après bac`="Après le bac",
         type_diplome=case_when(
           type_diplome=="licence_pro"~"Licence pro",
           type_diplome=="master_LMD"~"Master LMD",
           type_diplome=="master_MEEF"~"Master MEEF"
         )
  ) %>% 
  rename(`Type diplôme`=type_diplome) %>% 
  group_by(`Type diplôme`,`Avant/après bac`) %>% 
  summarise(
    Volume=n()
  ) %>% 
  ungroup() %>% 
  mutate(
    "Part base"=prop.table(Volume),
    Base="InserSup"
  )

source(file.path(this.path::this.dir(),
                 "functions/expo_mef_catalogue_partenaire.R")
)


famillemetiers_2024 <- read_excel(file.path(chemin_racine_data,"affelnet/2024/2024 - Familles de métiers- MANQUE cybersécurité.xlsx"),
                                  sheet = "2024 ok")