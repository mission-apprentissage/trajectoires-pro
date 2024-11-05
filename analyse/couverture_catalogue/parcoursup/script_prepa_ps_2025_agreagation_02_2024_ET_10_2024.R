#Librairies ----
library(tidyverse)
library(readxl)
library(rmarkdown)

setwd(dirname(rstudioapi::getSourceEditorContext()$path))

chemin_racine <- "../../../.."
chemin_racine_data <- file.path(chemin_racine,"0- data")
source("prepa_data_init_generique.R")


## Parcoursup 10_2024----

parcoursup_2024_02 <- read_excel(file.path(chemin_racine_data,"parcoursup/2024/listesFormationsInsertJeunes_toutesFormations_020224.xls"))
parcoursup_2024_10 <- read_excel(file.path(chemin_racine_data,"parcoursup/2024/listeFormationsInserJeunes_finSession2024_01_10_2024.xls"))

parcoursup_2024_agregation_10_2024_02 <- parcoursup_2024_10 %>% 
  mutate(present_oct=T)%>%
  left_join(
    parcoursup_2024_02 %>% 
      setNames(paste0(names(.),"_fev")) %>% 
      mutate(present_fev=T),
    by=c("CODEFORMATIONACCUEIL"="CODEFORMATIONACCUEIL_fev")
  ) %>% 
  mutate(
    present_fev=ifelse(is.na(present_fev),F,present_fev),
    present_oct=ifelse(is.na(present_oct),F,present_oct)
  ) %>% 
  mutate(
    verif=case_when(
      UAI_GES==UAI_GES_fev & UAI_COMPOSANTE==UAI_COMPOSANTE_fev& UAI_AFF==UAI_AFF_fev & 
        CODEFORMATION==CODEFORMATION_fev & CODESPÉCIALITÉ==CODESPÉCIALITÉ_fev~T
    )
  )  %>% 
  mutate(verif=ifelse(is.na(verif),F,T)) %>% 
  mutate(
    CODEMEF=case_when(
      is.na(CODEMEF)~CODEMEF_fev,
      T~CODEMEF
    ),
    CODECFD=case_when(
      is.na(CODECFD)~CODECFD_fev,
      T~CODECFD
    ),
    CODESISE=CODESISE,
    LISTE_IDEO=LISTE_IDEO,
    ID_RCO=case_when(
      is.na(ID_RCO)~ID_RCO_fev,
      T~ID_RCO
    ),
    LISTE_RNCP=case_when(
      is.na(LISTE_RNCP)~LISTE_RNCP_fev,
      T~LISTE_RNCP
    ),
    NBDEDEMANDES=case_when(
      is.na(NBDEDEMANDES)~NBDEDEMANDES_fev,
      T~NBDEDEMANDES
    )
  ) %>% 
  select(names(parcoursup_2024_10),present_fev,present_oct) %>% 
  bind_rows(
    parcoursup_2024_02 %>% 
      mutate(present_fev=T,
             present_oct=F) %>% 
      filter(!CODEFORMATIONACCUEIL %in% parcoursup_2024_10$CODEFORMATIONACCUEIL)
  )


parcoursup_nomenclature_de_ref <- parcoursup_2024_agregation_10_2024_02 %>% 
  distinct(CODECFD,LISTE_RNCP,LISTE_IDEO,CODESISE) %>% 
  mutate(
    nomenclature_de_ref=case_when(
      !is.na(CODECFD)~"CODECFD",
      !is.na(LISTE_RNCP)~"LISTE_RNCP",
      !is.na(LISTE_IDEO)~"LISTE_IDEO",
      !is.na(CODESISE)~"CODESISE",
      T~"Aucune"
    ),
    # nomenclature_de_ref=factor(nomenclature_de_ref,
    #                            levels=c("CFD","RNCP","IDEO","Aucune")),
    id=1:n()
  ) 



parcoursup_nomenclature_de_ref_renseigne <-   parcoursup_nomenclature_de_ref %>% 
  left_join(
    #CFD
    parcoursup_nomenclature_de_ref %>% 
      filter(!is.na(CODECFD)) %>%  
      left_join(
        n_formation_diplome %>% 
          select(FORMATION_DIPLOME,LIBELLE_COURT,NIVEAU_QUALIFICATION_RNCP),
        by=c("CODECFD"="FORMATION_DIPLOME")
      ) %>% 
      rename(
        lib_type_formation_via_CFD=LIBELLE_COURT,
        niveau_formation_via_CFD=NIVEAU_QUALIFICATION_RNCP
      ) %>% 
      mutate(niveau_formation_via_CFD=as.numeric(niveau_formation_via_CFD)) %>% 
      distinct(id,niveau_formation_via_CFD,lib_type_formation_via_CFD) %>% 
      mutate(qualite_CFD=ifelse(is.na(lib_type_formation_via_CFD),"Correspondance impossible via CFD","Correspondance possible via CFD")),
    by="id"
  ) %>% 
  left_join(
    #LISTE_RNCP
    parcoursup_nomenclature_de_ref %>% 
      filter(!is.na(LISTE_RNCP)) %>%   
      mutate(LISTE_RNCP=map(LISTE_RNCP,function(x){
        unlist(str_split(x,";"))
      })) %>% 
      unnest() %>% 
      left_join(
        inserJeune_certifinfo_correspondance %>% 
          select(`Code RNCP`,Libelle_Type_Diplome,Code_Niveau_Europeen) %>% 
          mutate_all(as.character),
        by=c("LISTE_RNCP"="Code RNCP")
      ) %>% 
      rename(
        lib_type_formation_via_RNCP=Libelle_Type_Diplome,
        niveau_formation_via_RNCP=Code_Niveau_Europeen
      ) %>% 
      mutate(niveau_formation_via_RNCP=as.numeric(niveau_formation_via_RNCP)) %>% 
      distinct(id,niveau_formation_via_RNCP,lib_type_formation_via_RNCP) %>%
      mutate(qualite_RNCP=ifelse(is.na(lib_type_formation_via_RNCP),"Correspondance impossible via RNCP","Correspondance possible via RNCP"),
             qualite_RNCP=factor(qualite_RNCP,levels=c("Correspondance possible via RNCP","Correspondance impossible via RNCP"))) %>% 
      group_by(id) %>% 
      nest() %>% 
      mutate(data=map(data,function(df){
        
        temp <- df %>%
          distinct() %>% 
          filter(as.numeric(qualite_RNCP)==min(as.numeric(qualite_RNCP))) 
        if(nrow(temp)>1){
          if(nrow(drop_na(temp))==1){
            temp <- drop_na(temp)
          }else if(nrow(drop_na(temp))>1){
            temp <- temp %>% 
              drop_na() %>% 
              slice(1)
          }else {
            temp <- temp %>% 
              slice(1)
          } 
        }
        
        temp
        
      })) %>% 
      unnest()  %>% 
      ungroup() %>% 
      mutate(qualite_RNCP=as.character(qualite_RNCP)),
    by="id"
  ) %>% 
  left_join(
    #LISTE_IDEO
    
    parcoursup_nomenclature_de_ref %>% 
      filter(!is.na(LISTE_IDEO)) %>%   
      mutate(LISTE_IDEO=map(LISTE_IDEO,function(x){
        unlist(str_split(x,";"))
      })) %>% 
      unnest() %>% 
      left_join(
        table_de_passage_codes_certifications_et_formations %>% 
          distinct(`CI Niveau européen`,`CI Intitulé type diplôme`,`Idéo Identifiant formation`),
        by=c("LISTE_IDEO"="Idéo Identifiant formation")
      ) %>% 
      rename(
        lib_type_formation_via_IDEO=`CI Intitulé type diplôme`,
        niveau_formation_via_IDEO=`CI Niveau européen`
      ) %>% 
      mutate(niveau_formation_via_IDEO=as.numeric(niveau_formation_via_IDEO)) %>% 
      distinct(id,niveau_formation_via_IDEO,lib_type_formation_via_IDEO) %>%
      mutate(qualite_IDEO=ifelse(is.na(lib_type_formation_via_IDEO),"Correspondance impossible via IDEO","Correspondance possible via IDEO"),
             qualite_IDEO=factor(qualite_IDEO,levels=c("Correspondance possible via IDEO","Correspondance impossible via IDEO"))) %>% 
      group_by(id) %>% 
      nest() %>% 
      mutate(data=map(data,function(df){
        temp <- df %>%
          distinct() %>% 
          filter(as.numeric(qualite_IDEO)==min(as.numeric(qualite_IDEO))) 
        if(nrow(temp)>1){
          if(nrow(drop_na(temp))==1){
            temp <- drop_na(temp)
          }else if(nrow(drop_na(temp))>1){
            temp <- temp %>% 
              drop_na() %>% 
              slice(1)
          }else {
            temp <- temp %>% 
              slice(1)
          } 
        }
        
        temp
      })) %>% 
      unnest()  %>% 
      ungroup()%>% 
      mutate(qualite_IDEO=as.character(qualite_IDEO)),
    by="id"
  ) %>% 
  left_join(
    #CODESISE
    
    parcoursup_nomenclature_de_ref %>% 
      filter(!is.na(CODESISE)) %>% 
      left_join(
        inserJeune_certifinfo_correspondance %>% 
          select(`Code Sise`,Libelle_Type_Diplome,Code_Niveau_Europeen) %>% 
          mutate_all(as.character),
        by=c("CODESISE"="Code Sise")
      ) %>% 
      rename(
        lib_type_formation_via_SISE=Libelle_Type_Diplome,
        niveau_formation_via_SISE=Code_Niveau_Europeen
      ) %>% 
      mutate(niveau_formation_via_SISE=as.numeric(niveau_formation_via_SISE)) %>% 
      distinct(id,niveau_formation_via_SISE,lib_type_formation_via_SISE) %>%
      mutate(qualite_SISE=ifelse(is.na(lib_type_formation_via_SISE),"Correspondance impossible via SISE","Correspondance possible via SISE"),
             qualite_SISE=factor(qualite_SISE,levels=c("Correspondance possible via SISE","Correspondance impossible via SISE"))) %>% 
      group_by(id) %>% 
      nest() %>% 
      mutate(data=map(data,function(df){
        temp <- df %>%
          distinct() %>% 
          filter(as.numeric(qualite_SISE)==min(as.numeric(qualite_SISE))) 
        if(nrow(temp)>1){
          if(nrow(drop_na(temp))==1){
            temp <- drop_na(temp)
          }else if(nrow(drop_na(temp))>1){
            temp <- temp %>% 
              drop_na() %>% 
              slice(1)
          }else {
            temp <- temp %>% 
              slice(1)
          } 
        }
        
        temp
      })) %>% 
      unnest()  %>% 
      ungroup()%>% 
      mutate(qualite_SISE=as.character(qualite_SISE)),
    by="id"
  ) %>%  
  mutate(
    niveau_formation=case_when(
      !is.na(niveau_formation_via_CFD)~as.character(niveau_formation_via_CFD),
      !is.na(niveau_formation_via_RNCP)~as.character(niveau_formation_via_RNCP),
      !is.na(niveau_formation_via_IDEO)~as.character(niveau_formation_via_IDEO),
      !is.na(niveau_formation_via_SISE)~as.character(niveau_formation_via_SISE),
      T~"Niveau inconnu"
    ),
    lib_type_formation=case_when(
      !is.na(lib_type_formation_via_CFD)~lib_type_formation_via_CFD,
      !is.na(lib_type_formation_via_RNCP)~lib_type_formation_via_RNCP,
      !is.na(lib_type_formation_via_IDEO)~lib_type_formation_via_IDEO,
      !is.na(lib_type_formation_via_SISE)~lib_type_formation_via_SISE,
      T~"Niveau inconnu"
    ),
    qualite_CFD=ifelse(is.na(qualite_CFD),"Pas de CFD renseigné",qualite_CFD),
    qualite_RNCP=ifelse(is.na(qualite_RNCP),"Pas de RNCP renseigné",qualite_RNCP),
    qualite_IDEO=ifelse(is.na(qualite_IDEO),"Pas de IDEO renseigné",qualite_IDEO),
    qualite_SISE=ifelse(is.na(qualite_SISE),"Pas de SISE renseigné",qualite_SISE)
    
  ) %>% 
  select(
    CODECFD,LISTE_RNCP,LISTE_IDEO,CODESISE,nomenclature_de_ref,id,niveau_formation,lib_type_formation,contains("qualite_")
  ) %>% 
  distinct() %>% 
  group_by(CODECFD,LISTE_IDEO,LISTE_RNCP,CODESISE,nomenclature_de_ref,id,qualite_CFD,qualite_RNCP,qualite_IDEO,qualite_SISE) %>%   
  nest() %>% 
  mutate(data=map(data,function(df){
    if(nrow(df)>1){
      niveau_formation_temp <- unique(df$niveau_formation)
      lib_type_formation_temp <- paste0(unique(df$lib_type_formation),sep="",collapse = ";")
      temp <- tibble(
        niveau_formation=niveau_formation_temp,
        lib_type_formation=lib_type_formation_temp
      )  
    }else{
      temp <- df
    }
    return(temp)
  })) %>% 
  unnest() %>% 
  ungroup() %>% 
  mutate(
    qualite_code=case_when(
      qualite_CFD=="Pas de CFD renseigné" & qualite_RNCP=="Pas de RNCP renseigné" & qualite_IDEO =="Pas de IDEO renseigné" & qualite_SISE =="Pas de SISE renseigné" ~"Pas de code renseigné",
      qualite_CFD=="Correspondance possible via CFD" | qualite_RNCP=="Correspondance possible via RNCP" | qualite_IDEO =="Correspondance possible via IDEO" | qualite_SISE =="Correspondance possible via SISE" ~"Correspondance possible via un des codes renseignés",
      T~"Correspondance impossible via les codes renseignés"
    )
  ) 

parcoursup_nomenclature_de_ref_renseigne <- parcoursup_nomenclature_de_ref_renseigne %>% 
  filter(niveau_formation!="Niveau inconnu") %>% 
  bind_rows(
    parcoursup_nomenclature_de_ref_renseigne %>% 
      filter(niveau_formation=="Niveau inconnu") %>% 
      select(-niveau_formation,-id) %>% 
      left_join(
        parcoursup_nomenclature_de_ref_renseigne %>% 
          filter(niveau_formation!="Niveau inconnu") %>% 
          select("CODECFD","LISTE_RNCP","LISTE_IDEO","CODESISE",niveau_formation,id),
        by=c("CODECFD","LISTE_RNCP","LISTE_IDEO","CODESISE")
      ) %>% 
      filter(is.na(niveau_formation)) %>% 
      mutate(niveau_formation="Niveau inconnu")
  ) %>% 
  distinct()



### Parcoursup dans InserSup (calculé initialement)----

listeFormationsInserJeunes_finSession2024_01_10_2024_a_transmettre_PS <- read_excel("C:/Users/arnau/d-sidd Dropbox/Arnaud milet/0_beta/1- Exposition/Groupe-002 - Parcoursup/003 - 4 - Prepa ParcourSup 2025/listeFormationsInserJeunes_finSession2024_01_10_2024_a_transmettre_PS.xlsx")


parcoursup_nomenclature_de_ref_renseigne <- parcoursup_nomenclature_de_ref_renseigne %>% 
  filter(niveau_formation!="Niveau inconnu") %>% 
  bind_rows(
    parcoursup_nomenclature_de_ref_renseigne %>% 
      filter(niveau_formation=="Niveau inconnu") %>% 
      select(-niveau_formation,-id) %>% 
      left_join(
        parcoursup_nomenclature_de_ref_renseigne %>% 
          filter(niveau_formation!="Niveau inconnu") %>% 
          select("CODECFD","LISTE_RNCP","LISTE_IDEO","CODESISE",niveau_formation,id),
        by=c("CODECFD","LISTE_RNCP","LISTE_IDEO","CODESISE")
      ) %>% 
      filter(!is.na(niveau_formation)) %>% 
      mutate(niveau_formation="Niveau inconnu")
  )



parcoursup_2024_agregation_10_2024_02_param<- parcoursup_2024_agregation_10_2024_02 %>% 
  filter(FORMATION_PARAMÉTRÉE=="Paramétrée") %>% 
  left_join(
    parcoursup_nomenclature_de_ref_renseigne %>% 
      filter(!nomenclature_de_ref=="Aucune") %>% 
      select(-nomenclature_de_ref,-id) %>% 
      distinct() %>% 
      mutate_all(as.character),
    by=c("CODECFD","LISTE_RNCP","LISTE_IDEO","CODESISE")
  ) %>% 
  mutate(
    lib_type_formation=ifelse(is.na(lib_type_formation),LIBFORMATION,lib_type_formation),
    niveau_formation=ifelse(is.na(niveau_formation),"Niveau inconnu",niveau_formation)
  )

### Catalogue des MNE ----

catalogue_mne <- read_csv2(file.path(chemin_racine_data,"catalogue MNE/formation_2024-10-07T13_25_04.773Z.csv"))

catalogue_mne <- catalogue_mne %>% 
  mutate_all(str_remove_all,"=") %>% 
  mutate_all(str_remove_all,"\"")


### Parcoursup dans InserJeunes ----

parcoursup_2024_ij <- parcoursup_2024_agregation_10_2024_02_param %>% 
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

#### normal ----
parcoursup_2024_ij_normal <- parcoursup_2024_ij %>% 
  select(UAI_GES,UAI_AFF,UAI_COMPOSANTE,MEF_STAT_11,APPRENTISSAGEOUSCOLAIRE,CODEFORMATIONACCUEIL) %>% 
  pivot_longer(cols = contains("UAI"),names_to = "type_uai",values_to = "uai") %>% 
  select(type_uai,uai,everything()) %>% 
  setNames(c("TYPE_UAI","UAI","MEFSTAT11","Filiere","CODEFORMATIONACCUEIL")) %>% 
  mutate(appariement="normal")

#### inverse ----
parcoursup_2024_ij_inverse <- parcoursup_2024_ij %>% 
  select(UAI_GES,UAI_AFF,UAI_COMPOSANTE,MEF_STAT_11,APPRENTISSAGEOUSCOLAIRE,CODEFORMATIONACCUEIL) %>% 
  pivot_longer(cols = contains("UAI"),names_to = "type_uai",values_to = "uai") %>% 
  select(type_uai,uai,everything()) %>% 
  setNames(c("TYPE_UAI","UAI","MEFSTAT11","Filiere","CODEFORMATIONACCUEIL")) %>% 
  mutate(appariement="inverse",
         Filiere=ifelse(Filiere=="Apprentissage","Scolaire","Apprentissage"))


#### MNE ----

parcoursup_2024_ij_mne <- parcoursup_2024_agregation_10_2024_02_param %>% 
  select(UAI_GES,UAI_AFF,UAI_COMPOSANTE,CODEFORMATIONACCUEIL,ID_RCO,APPRENTISSAGEOUSCOLAIRE) %>% 
  left_join(
    catalogue_mne %>% 
      select(`Clé ministere educatif`,`Formation: code CFD`) %>% 
      filter(
        `Formation: code CFD`%in%data_meta_formationsStats_init$code_formation_diplome    
      ),
    by=c("ID_RCO"="Clé ministere educatif")
  ) %>% 
  drop_na() %>%  
  left_join(
    n_mef %>% 
      mutate(
        DATE_FERMETURE=as.Date(DATE_FERMETURE,"%d/%m/%Y"),
        DATE_OUVERTURE=as.Date(DATE_OUVERTURE,"%d/%m/%Y")     
      ) %>% 
      filter(
        (FORMATION_DIPLOME%in%data_meta_formationsStats_init$code_formation_diplome),
        (is.na(DATE_FERMETURE) | DATE_FERMETURE>=(as.Date("2024/08/31") %m+% years(DUREE_DISPOSITIF))),
        DATE_OUVERTURE <=as.Date("2024/08/31")
      ) %>% 
      group_by(FORMATION_DIPLOME) %>% 
      filter(ANNEE_DISPOSITIF ==max(ANNEE_DISPOSITIF )) %>% 
      select(FORMATION_DIPLOME,MEF_STAT_11) %>% 
      distinct(),
    by=c("Formation: code CFD"="FORMATION_DIPLOME") 
  ) %>% 
  select(UAI_GES,UAI_AFF,UAI_COMPOSANTE,MEF_STAT_11,APPRENTISSAGEOUSCOLAIRE,CODEFORMATIONACCUEIL) %>% 
  pivot_longer(cols = contains("UAI"),names_to = "type_uai",values_to = "uai") %>% 
  select(type_uai,uai,everything()) %>% 
  drop_na() %>% 
  setNames(c("TYPE_UAI","UAI","MEFSTAT11","Filiere","CODEFORMATIONACCUEIL")) %>% 
  mutate(appariement="mne")



#### MNE - inverse ----

parcoursup_2024_ij_mne_inverse <- parcoursup_2024_agregation_10_2024_02_param %>% 
  select(UAI_GES,UAI_AFF,UAI_COMPOSANTE,CODEFORMATIONACCUEIL,ID_RCO,APPRENTISSAGEOUSCOLAIRE) %>% 
  left_join(
    catalogue_mne %>% 
      select(`Clé ministere educatif`,`Formation: code CFD`) %>% 
      filter(
        `Formation: code CFD`%in%data_meta_formationsStats_init$code_formation_diplome    
      ),
    by=c("ID_RCO"="Clé ministere educatif")
  ) %>% 
  drop_na() %>%  
  left_join(
    n_mef %>% 
      mutate(
        DATE_FERMETURE=as.Date(DATE_FERMETURE,"%d/%m/%Y"),
        DATE_OUVERTURE=as.Date(DATE_OUVERTURE,"%d/%m/%Y")     
      ) %>% 
      filter(
        (FORMATION_DIPLOME%in%data_meta_formationsStats_init$code_formation_diplome),
        (is.na(DATE_FERMETURE) | DATE_FERMETURE>=(as.Date("2024/08/31") %m+% years(DUREE_DISPOSITIF))),
        DATE_OUVERTURE <=as.Date("2024/08/31")
      ) %>% 
      group_by(FORMATION_DIPLOME) %>% 
      filter(ANNEE_DISPOSITIF ==max(ANNEE_DISPOSITIF )) %>% 
      select(FORMATION_DIPLOME,MEF_STAT_11) %>% 
      distinct(),
    by=c("Formation: code CFD"="FORMATION_DIPLOME") 
  ) %>% 
  select(UAI_GES,UAI_AFF,UAI_COMPOSANTE,MEF_STAT_11,APPRENTISSAGEOUSCOLAIRE,CODEFORMATIONACCUEIL) %>% 
  pivot_longer(cols = contains("UAI"),names_to = "type_uai",values_to = "uai") %>% 
  select(type_uai,uai,everything()) %>% 
  drop_na() %>% 
  setNames(c("TYPE_UAI","UAI","MEFSTAT11","Filiere","CODEFORMATIONACCUEIL")) %>% 
  mutate(appariement="mne-inverse",
         Filiere=ifelse(Filiere=="Apprentissage","Scolaire","Apprentissage"))





#### RNCP ----

parcoursup_2024_ij_rncp <- parcoursup_2024_agregation_10_2024_02_param %>% 
  select(UAI_GES,UAI_AFF,UAI_COMPOSANTE,CODEFORMATIONACCUEIL,LISTE_RNCP,APPRENTISSAGEOUSCOLAIRE)%>% 
  mutate(
    LISTE_RNCP=map(LISTE_RNCP,function(x){
      unlist(str_split(x,pattern=";"))
    })
  ) %>% 
  unnest(LISTE_RNCP) %>%   
  left_join(
    opendata_certifinfo %>% 
      filter(Code_Scolarité!="") %>% 
      distinct(Code_RNCP,Code_Scolarité) %>% 
      as_tibble() %>% 
      drop_na() %>% 
      mutate(Code_RNCP=as.character(Code_RNCP)) ,
    by=c("LISTE_RNCP"="Code_RNCP")
  ) %>% 
  drop_na()  %>%  
  left_join(
    n_mef %>% 
      mutate(
        DATE_FERMETURE=as.Date(DATE_FERMETURE,"%d/%m/%Y"),
        DATE_OUVERTURE=as.Date(DATE_OUVERTURE,"%d/%m/%Y")     
      ) %>% 
      filter(
        (FORMATION_DIPLOME%in%data_meta_formationsStats_init$code_formation_diplome),
        (is.na(DATE_FERMETURE) | DATE_FERMETURE>=(as.Date("2024/08/31") %m+% years(DUREE_DISPOSITIF))),
        DATE_OUVERTURE <=as.Date("2024/08/31")
      ) %>% 
      group_by(FORMATION_DIPLOME) %>% 
      filter(ANNEE_DISPOSITIF ==max(ANNEE_DISPOSITIF )) %>% 
      select(FORMATION_DIPLOME,MEF_STAT_11) %>% 
      distinct(),
    by=c("Code_Scolarité"="FORMATION_DIPLOME") 
  ) %>% 
  select(UAI_GES,UAI_AFF,UAI_COMPOSANTE,MEF_STAT_11,APPRENTISSAGEOUSCOLAIRE,CODEFORMATIONACCUEIL) %>% 
  pivot_longer(cols = contains("UAI"),names_to = "type_uai",values_to = "uai") %>% 
  select(type_uai,uai,everything()) %>% 
  drop_na() %>% 
  setNames(c("TYPE_UAI","UAI","MEFSTAT11","Filiere","CODEFORMATIONACCUEIL")) %>% 
  mutate(appariement="rncp")



parcoursup_2024_ij_inverse_rncp <- parcoursup_2024_agregation_10_2024_02_param %>% 
  select(UAI_GES,UAI_AFF,UAI_COMPOSANTE,CODEFORMATIONACCUEIL,LISTE_RNCP,APPRENTISSAGEOUSCOLAIRE)%>% 
  mutate(
    LISTE_RNCP=map(LISTE_RNCP,function(x){
      unlist(str_split(x,pattern=";"))
    })
  ) %>% 
  unnest(LISTE_RNCP) %>%   
  left_join(
    opendata_certifinfo %>% 
      filter(Code_Scolarité!="") %>% 
      distinct(Code_RNCP,Code_Scolarité) %>% 
      as_tibble() %>% 
      drop_na() %>% 
      mutate(Code_RNCP=as.character(Code_RNCP)) ,
    by=c("LISTE_RNCP"="Code_RNCP")
  ) %>% 
  drop_na()  %>%  
  left_join(
    n_mef %>% 
      mutate(
        DATE_FERMETURE=as.Date(DATE_FERMETURE,"%d/%m/%Y"),
        DATE_OUVERTURE=as.Date(DATE_OUVERTURE,"%d/%m/%Y")     
      ) %>% 
      filter(
        (FORMATION_DIPLOME%in%data_meta_formationsStats_init$code_formation_diplome),
        (is.na(DATE_FERMETURE) | DATE_FERMETURE>=(as.Date("2024/08/31") %m+% years(DUREE_DISPOSITIF))),
        DATE_OUVERTURE <=as.Date("2024/08/31")
      ) %>% 
      group_by(FORMATION_DIPLOME) %>% 
      filter(ANNEE_DISPOSITIF ==max(ANNEE_DISPOSITIF )) %>% 
      select(FORMATION_DIPLOME,MEF_STAT_11) %>% 
      distinct(),
    by=c("Code_Scolarité"="FORMATION_DIPLOME") 
  ) %>% 
  select(UAI_GES,UAI_AFF,UAI_COMPOSANTE,MEF_STAT_11,APPRENTISSAGEOUSCOLAIRE,CODEFORMATIONACCUEIL) %>% 
  pivot_longer(cols = contains("UAI"),names_to = "type_uai",values_to = "uai") %>% 
  select(type_uai,uai,everything()) %>% 
  drop_na() %>% 
  setNames(c("TYPE_UAI","UAI","MEFSTAT11","Filiere","CODEFORMATIONACCUEIL")) %>% 
  mutate(appariement="rncp-inverse",
         Filiere=ifelse(Filiere=="Apprentissage","Scolaire","Apprentissage"))


#### IDEO ----

parcoursup_2024_ij_ideo <- parcoursup_2024_agregation_10_2024_02_param %>% 
  select(UAI_GES,UAI_AFF,UAI_COMPOSANTE,CODEFORMATIONACCUEIL,LISTE_IDEO,APPRENTISSAGEOUSCOLAIRE) %>% 
  drop_na() %>% 
  mutate(
    LISTE_IDEO=map(LISTE_IDEO,function(x){
      unlist(str_split(x,pattern=";"))
    })
  ) %>% 
  unnest(LISTE_IDEO) %>% 
  mutate(LISTE_IDEO=str_trim(LISTE_IDEO)) %>% 
  left_join(
    opendata_certifinfo %>% 
      filter(Code_Scolarité!="") %>% 
      distinct(codeIdeo2,Code_Scolarité) %>% 
      as_tibble() %>% 
      drop_na() %>% 
      mutate(codeIdeo2=as.character(codeIdeo2)) ,
    by=c("LISTE_IDEO"="codeIdeo2")
  ) %>% 
  drop_na() %>% 
  left_join(
    n_mef %>% 
      mutate(
        DATE_FERMETURE=as.Date(DATE_FERMETURE,"%d/%m/%Y"),
        DATE_OUVERTURE=as.Date(DATE_OUVERTURE,"%d/%m/%Y")     
      ) %>% 
      filter(
        (FORMATION_DIPLOME%in%data_meta_formationsStats_init$code_formation_diplome),
        (is.na(DATE_FERMETURE) | DATE_FERMETURE>=(as.Date("2024/08/31") %m+% years(DUREE_DISPOSITIF))),
        DATE_OUVERTURE <=as.Date("2024/08/31")
      ) %>% 
      group_by(FORMATION_DIPLOME) %>% 
      filter(ANNEE_DISPOSITIF ==max(ANNEE_DISPOSITIF )) %>% 
      select(FORMATION_DIPLOME,MEF_STAT_11) %>% 
      distinct(),
    by=c("Code_Scolarité"="FORMATION_DIPLOME") 
  ) %>% 
  drop_na() %>% 
  select(UAI_GES,UAI_AFF,UAI_COMPOSANTE,MEF_STAT_11,APPRENTISSAGEOUSCOLAIRE,CODEFORMATIONACCUEIL) %>% 
  pivot_longer(cols = contains("UAI"),names_to = "type_uai",values_to = "uai") %>% 
  select(type_uai,uai,everything()) %>% 
  drop_na() %>% 
  setNames(c("TYPE_UAI","UAI","MEFSTAT11","Filiere","CODEFORMATIONACCUEIL")) %>% 
  mutate(appariement="ideo")


parcoursup_2024_ij_ideo_inverse <- parcoursup_2024_agregation_10_2024_02_param %>% 
  select(UAI_GES,UAI_AFF,UAI_COMPOSANTE,CODEFORMATIONACCUEIL,LISTE_IDEO,APPRENTISSAGEOUSCOLAIRE) %>% 
  drop_na() %>% 
  mutate(
    LISTE_IDEO=map(LISTE_IDEO,function(x){
      unlist(str_split(x,pattern=";"))
    })
  ) %>% 
  unnest(LISTE_IDEO) %>% 
  mutate(LISTE_IDEO=str_trim(LISTE_IDEO)) %>% 
  left_join(
    opendata_certifinfo %>% 
      filter(Code_Scolarité!="") %>% 
      distinct(codeIdeo2,Code_Scolarité) %>% 
      as_tibble() %>% 
      drop_na() %>% 
      mutate(codeIdeo2=as.character(codeIdeo2)) ,
    by=c("LISTE_IDEO"="codeIdeo2")
  ) %>% 
  drop_na() %>% 
  left_join(
    n_mef %>% 
      mutate(
        DATE_FERMETURE=as.Date(DATE_FERMETURE,"%d/%m/%Y"),
        DATE_OUVERTURE=as.Date(DATE_OUVERTURE,"%d/%m/%Y")     
      ) %>% 
      filter(
        (FORMATION_DIPLOME%in%data_meta_formationsStats_init$code_formation_diplome),
        (is.na(DATE_FERMETURE) | DATE_FERMETURE>=(as.Date("2024/08/31") %m+% years(DUREE_DISPOSITIF))),
        DATE_OUVERTURE <=as.Date("2024/08/31")
      ) %>% 
      group_by(FORMATION_DIPLOME) %>% 
      filter(ANNEE_DISPOSITIF ==max(ANNEE_DISPOSITIF )) %>% 
      select(FORMATION_DIPLOME,MEF_STAT_11) %>% 
      distinct(),
    by=c("Code_Scolarité"="FORMATION_DIPLOME") 
  ) %>% 
  drop_na() %>% 
  select(UAI_GES,UAI_AFF,UAI_COMPOSANTE,MEF_STAT_11,APPRENTISSAGEOUSCOLAIRE,CODEFORMATIONACCUEIL) %>% 
  pivot_longer(cols = contains("UAI"),names_to = "type_uai",values_to = "uai") %>% 
  select(type_uai,uai,everything()) %>% 
  drop_na() %>% 
  setNames(c("TYPE_UAI","UAI","MEFSTAT11","Filiere","CODEFORMATIONACCUEIL")) %>% 
  mutate(appariement="ideo-inverse",
         Filiere=ifelse(Filiere=="Apprentissage","Scolaire","Apprentissage"))

#### Agregation ensemble ----
parcoursup_2024_ij_ensemble_analyse <- bind_rows(
  parcoursup_2024_ij_ideo, 
  parcoursup_2024_ij_ideo_inverse, 
  parcoursup_2024_ij_inverse,
  parcoursup_2024_ij_mne_inverse, 
  parcoursup_2024_ij_mne, 
  parcoursup_2024_ij_normal, 
  parcoursup_2024_ij_rncp, 
  parcoursup_2024_ij_inverse_rncp
) %>% 
  mutate(TYPE_UAI=factor(TYPE_UAI,levels=c("UAI_COMPOSANTE","UAI_AFF","UAI_GES")),
         appariement=factor(appariement,levels=c("normal","rncp","ideo","mne","inverse","rncp-inverse","ideo-inverse","mne-inverse")) 
  ) %>% 
  group_by(UAI,MEFSTAT11,Filiere,CODEFORMATIONACCUEIL,appariement) %>% 
  filter(as.numeric(TYPE_UAI)==min(as.numeric(TYPE_UAI)))%>% 
  group_by(UAI,MEFSTAT11,Filiere,CODEFORMATIONACCUEIL) %>% 
  filter(as.numeric(appariement)==min(as.numeric(appariement))) %>% 
  ungroup()


# parcoursup_2024_ij_ensemble_analyse_renseigne <- expo_mef_catalogue_partenaire(catalogue_init = parcoursup_2024_ij_ensemble_analyse,type_source = "affelnet")



map(c("normal","rncp","ideo","mne","inverse","rncp-inverse","ideo-inverse","mne-inverse"),function(val_appariemment){
  print(val_appariemment)
  if(val_appariemment=="normal"){
    temp <<- expo_mef_catalogue_partenaire(catalogue_init = parcoursup_2024_ij_ensemble_analyse %>% 
                                             filter(appariement==val_appariemment),type_source = "affelnet")
  }else{
    temp <<- parcoursup_2024_ij_ensemble_analyse %>% 
      filter(appariement==val_appariemment,
             !CODEFORMATIONACCUEIL%in% 
               (temp %>% 
                  filter(Couverture%in%c("Couvert","Sous le seuil de 20 élèves")) %>% 
                  distinct(CODEFORMATIONACCUEIL) %>% 
                  pull(CODEFORMATIONACCUEIL))
      ) %>% 
      expo_mef_catalogue_partenaire(type_source = "affelnet") %>% 
      bind_rows(temp,.)
  }
})


temp <- temp %>% 
  mutate(
    Couverture=factor(Couverture,levels=c("Couvert","Sous le seuil de 20 élèves","Non couvert")),
    type_uai=factor(type_uai,levels=c("UAI Lieu formation - Couvert + sous le seuil","UAI Formateur - Couvert + sous le seuil","UAI Gestionnaire - Couvert + sous le seuil","Non couvert"))) %>% 
  group_by(CODEFORMATIONACCUEIL) %>% 
  filter(as.numeric(Couverture)==min(as.numeric(Couverture))) %>% 
  filter(as.numeric(appariement)==min(as.numeric(appariement))) %>% 
  filter(as.numeric(TYPE_UAI)==min(as.numeric(TYPE_UAI))) %>% 
  filter(as.numeric(type_uai)==min(as.numeric(type_uai))) %>% 
  ungroup() %>% 
  distinct()


parcoursup_2024_ij_renseigne <- temp  %>% 
  group_by(across(c("TYPE_UAI", "UAI", "Filiere", "CODEFORMATIONACCUEIL", 
                    "appariement", "famillemetiers", "NIVEAU_FORMATION_DIPLOME", 
                    "LIBELLE_COURT", "NIVEAU_QUALIFICATION_RNCP", "type_formation", 
                    "libelle_type_diplome", "Couverture", "type_uai", "certificateur_valideur_simpli", 
                    "type_territoire", "Nouvelle_formation", "presence_UAI_ACCE", 
                    "presence_Code_Scolarité_certif_info", "scope", "perimetre"))) %>% 
  nest() %>% 
  mutate(
    data=map(data,function(df){
      tibble(
        MEFSTAT11=paste0(df$MEFSTAT11,collapse = ";"),
        FORMATION_DIPLOME=paste0(df$FORMATION_DIPLOME,collapse = ";"),
        data=list(df$data %>% 
                    reduce(bind_rows) %>% 
                    distinct())
      )
    })
  ) %>% 
  unnest() %>% 
  ungroup()  %>% 
  filter(!CODEFORMATIONACCUEIL %in% (listeFormationsInserJeunes_finSession2024_01_10_2024_a_transmettre_PS %>% 
                                       select(CODEFORMATIONACCUEIL) %>% 
                                       pull(CODEFORMATIONACCUEIL)
  ))








### Parcoursup pas dans InserJeunes et pas dans  InserSup ----
parcoursup_2024_pas_ij_pas_isup <- parcoursup_2024_agregation_10_2024_02_param %>% 
  filter(!CODEFORMATIONACCUEIL %in% (parcoursup_2024_ij_renseigne %>% 
                                       select(CODEFORMATIONACCUEIL) %>% 
                                       bind_rows(
                                         listeFormationsInserJeunes_finSession2024_01_10_2024_a_transmettre_PS %>% 
                                           select(CODEFORMATIONACCUEIL)
                                       ) %>% 
                                       pull(CODEFORMATIONACCUEIL))) %>%
  left_join(
    n_mef %>% 
      select(MEF,MEF_STAT_11),
    by=c("CODEMEF"="MEF")
  ) 



parcoursup_2024_pas_ij_pas_isup_simpli <- parcoursup_2024_pas_ij_pas_isup %>% 
  select(UAI_GES,MEF_STAT_11,APPRENTISSAGEOUSCOLAIRE,CODEFORMATIONACCUEIL) %>% 
  setNames(c("UAI","MEFSTAT11","Filiere","CODEFORMATIONACCUEIL")) 


parcoursup_2024_pas_ij_pas_isup_renseigne <- expo_mef_catalogue_partenaire(catalogue_init = parcoursup_2024_pas_ij_pas_isup_simpli,type_source = "affelnet")


parcoursup_2024_renseigne_pas_ij_pas_isup_et_ij <- parcoursup_2024_pas_ij_pas_isup_renseigne %>% 
  mutate(type="pas_isup_pas_ij") %>% 
  bind_rows(
    parcoursup_2024_ij_renseigne %>% 
      mutate(type="ij")
  )


parcoursup_2024_renseigne_pas_ij_pas_isup_et_ij <- parcoursup_2024_renseigne_pas_ij_pas_isup_et_ij %>% 
  select(-perimetre,-type_formation,-libelle_type_diplome) %>% 
  left_join(
    parcoursup_2024_agregation_10_2024_02_param %>% 
      mutate(
        LIBFORMATION=case_when(
          str_sub(LIBFORMATION,1,3)%in%c("BTS","BUT")~LIBFORMATION,
          T~ str_to_upper(str_split_fixed(LIBFORMATION," - ",2)[,1])
        )
      )%>% 
      select(CODEFORMATIONACCUEIL,LIBFORMATION,niveau_formation,qualite_code) %>% 
      rename(lib_type_formation=LIBFORMATION) %>% 
      mutate(
        perimetre=case_when(
          niveau_formation %in% c(0:5)~"InserSco",
          niveau_formation %in% c(6:8)~"InserSup",
          T~"Inconnu"
        )
      ) %>% 
      rename(type_formation=niveau_formation,
             libelle_type_diplome=lib_type_formation) ,
    by="CODEFORMATIONACCUEIL"
  ) %>% 
  mutate(
    type_formation=ifelse(is.na(qualite_code)|qualite_code=="Correspondance impossible via les codes renseignés","Problème de qualité du code formation en entrée",type_formation)
  ) 


### stats_catalogue ----

stats_catalogue_pas_ij_pas_isup_et_ij <- expo_mef_stats_catalogue_partenaire(
  catalogue_partenaire_renseigne = parcoursup_2024_renseigne_pas_ij_pas_isup_et_ij,
  type_voeux= "parcoursup"
)  

stats_catalogue_pas_ij_pas_isup_et_ij$stats_catalogue_partenaire <- stats_catalogue_pas_ij_pas_isup_et_ij$stats_catalogue_partenaire %>%
  filter(`Niveau de formation`=="Problème de qualité du code formation en entrée") %>% 
  select(-Périmètre ,-`Niveau de formation`) %>% 
  left_join(
    stats_catalogue_pas_ij_pas_isup_et_ij$stats_catalogue_partenaire %>%
      filter(`Niveau de formation`!="Problème de qualité du code formation en entrée") %>% 
      distinct(Périmètre ,`Niveau de formation`,`Type diplôme`) %>% 
      group_by(`Type diplôme`) %>% 
      slice(1),
    by=c("Type diplôme")
  ) %>% 
  mutate(
    Périmètre=ifelse(is.na(Périmètre),"Inconnu",Périmètre),
    `Niveau de formation`=ifelse(is.na(`Niveau de formation`),"Problème de qualité du code formation en entrée",`Niveau de formation`),
    "Non couvert - Problème de qualité du code formation en entrée (nb)"=`Nombre de formations`,
    "Non couvert - sans raison évidente (nb)"=`Non couvert - sans raison évidente (nb)`-`Non couvert - Problème de qualité du code formation en entrée (nb)`,
    "Non couvert - Problème de qualité du code formation en entrée (%)"=`Non couvert - Problème de qualité du code formation en entrée (nb)`/`Nombre de formations`,
  ) %>% 
  bind_rows(
    stats_catalogue_pas_ij_pas_isup_et_ij$stats_catalogue_partenaire %>%
      filter(`Niveau de formation`!="Problème de qualité du code formation en entrée")
  ) %>% 
  group_by(Périmètre,`Niveau de formation`,`Type diplôme`,Filiere) %>% 
  summarise_if(is.numeric,sum,na.rm=T) %>%   
  mutate(
    "Couverture (%)"=`Couverture (nb)`/`Nombre de formations`,
    "Formations non associées à une famille de métiers - Formations couvertes (%)"=`Formations non associées à une famille de métiers - Formations couvertes (nb)`/`Nombre de formations`,
    
    "Dont couvert par l'UAI lieu de formation (%)"=`Dont couvert par l'UAI lieu de formation (nb)`/`Nombre de formations`,
    "Dont couvert par l'UAI formateur (%)"=`Dont couvert par l'UAI formateur (nb)`/`Nombre de formations`,
    "Dont couvert par l'UAI gestionnaire (%)"=`Dont couvert par l'UAI Gestionnaire (nb)`/`Nombre de formations`,
    
    "Non couvert (%)"=`Non couvert (nb)`/`Nombre de formations`,
    "Dont sous le seuil de 20 élèves (%)"=`Dont sous le seuil de 20 élèves (nb)`/`Nombre de formations`,
    "Non couvert - Nouvelles formations (%)"=`Non couvert - Nouvelles formations (nb)`/`Nombre de formations`,
    "Non couvert - code certif inconnu (%)"=`Non couvert - code certif inconnu (nb)`/`Nombre de formations`,
    "Non couvert - Autres ministères certificateurs (%)"=`Non couvert - Autres ministères certificateurs (nb)`/`Nombre de formations`,
    "Non couvert - UAI inconnu (%)"=`Non couvert - UAI inconnu (nb)`/`Nombre de formations`,
    "Territoires mal couverts (%)"=`Territoires mal couverts (nb)`/`Nombre de formations`,
    "Non couvert - Problème de qualité du code formation en entrée (%)"=`Non couvert - Problème de qualité du code formation en entrée (nb)`/`Nombre de formations`,
    "Non couvert - sans raison évidente (%)"=`Non couvert - sans raison évidente (nb)`/`Nombre de formations`,
  ) %>% 
  ungroup()


stats_catalogue_pas_ij_pas_isup_et_ij$stats_catalogue_partenaire <- stats_catalogue_pas_ij_pas_isup_et_ij$stats_catalogue_partenaire %>% 
  mutate(`Part du  catalogue`=prop.table(`Nombre de formations`)) %>% 
  bind_rows(
    stats_catalogue_pas_ij_pas_isup_et_ij$stats_catalogue_partenaire %>% 
      filter(Périmètre=="Total")    
  )


stats_catalogue_pas_ij_pas_isup_et_ij$stats_catalogue_partenaire_voeux <- stats_catalogue_pas_ij_pas_isup_et_ij$stats_catalogue_partenaire_voeux %>%
  filter(`Niveau de formation`=="Problème de qualité du code formation en entrée") %>% 
  select(-Périmètre ,-`Niveau de formation`) %>% 
  left_join(
    stats_catalogue_pas_ij_pas_isup_et_ij$stats_catalogue_partenaire_voeux %>%
      filter(`Niveau de formation`!="Problème de qualité du code formation en entrée") %>% 
      distinct(Périmètre ,`Niveau de formation`,`Type diplôme`) %>% 
      group_by(`Type diplôme`) %>% 
      slice(1),
    by=c("Type diplôme")
  ) %>% 
  mutate(
    Périmètre=ifelse(is.na(Périmètre),"Inconnu",Périmètre),
    `Niveau de formation`=ifelse(is.na(`Niveau de formation`),"Problème de qualité du code formation en entrée",`Niveau de formation`),
    "Non couvert - Problème de qualité du code formation en entrée (nb)"=`Demandes tous voeux`,
    "Non couvert - sans raison évidente (nb)"=`Non couvert - sans raison évidente (nb)`-`Non couvert - Problème de qualité du code formation en entrée (nb)`,
    "Non couvert - Problème de qualité du code formation en entrée (%)"=`Non couvert - Problème de qualité du code formation en entrée (nb)`/`Demandes tous voeux`
  ) %>% 
  bind_rows(
    stats_catalogue_pas_ij_pas_isup_et_ij$stats_catalogue_partenaire_voeux %>%
      filter(`Niveau de formation`!="Problème de qualité du code formation en entrée")
  ) %>% 
  group_by(Périmètre,`Niveau de formation`,`Type diplôme`,Filiere) %>% 
  summarise_if(is.numeric,sum,na.rm=T) %>%   
  mutate(
    "Couverture (%)"=`Couverture (nb)`/`Demandes tous voeux`,
    "Formations non associées à une famille de métiers - Effectifs couverts (%)"=`Formations non associées à une famille de métiers - Effectifs couverts (nb)`/`Demandes tous voeux`,
    
    "Dont couvert par l'UAI lieu de formation (%)"=`Dont couvert par l'UAI lieu de formation (nb)`/`Demandes tous voeux`,
    "Dont couvert par l'UAI formateur (%)"=`Dont couvert par l'UAI formateur (nb)`/`Demandes tous voeux`,
    "Dont couvert par l'UAI gestionnaire (%)"=`Dont couvert par l'UAI Gestionnaire (nb)`/`Demandes tous voeux`,
    
    "Non couvert (%)"=`Non couvert (nb)`/`Demandes tous voeux`,
    "Dont sous le seuil de 20 élèves (%)"=`Dont sous le seuil de 20 élèves (nb)`/`Demandes tous voeux`,
    "Non couvert - Nouvelles formations (%)"=`Non couvert - Nouvelles formations (nb)`/`Demandes tous voeux`,
    "Non couvert - code certif inconnu (%)"=`Non couvert - code certif inconnu (nb)`/`Demandes tous voeux`,
    "Non couvert - Autres ministères certificateurs (%)"=`Non couvert - Autres ministères certificateurs (nb)`/`Demandes tous voeux`,
    "Non couvert - UAI inconnu (%)"=`Non couvert - UAI inconnu (nb)`/`Demandes tous voeux`,
    "Territoires mal couverts (%)"=`Territoires mal couverts (nb)`/`Demandes tous voeux`,
    "Non couvert - Problème de qualité du code formation en entrée (%)"=`Non couvert - Problème de qualité du code formation en entrée (nb)`/`Demandes tous voeux`,
    "Non couvert - sans raison évidente (%)"=`Non couvert - sans raison évidente (nb)`/`Demandes tous voeux`
  ) %>% 
  ungroup()


stats_catalogue_pas_ij_pas_isup_et_ij$stats_catalogue_partenaire_voeux <- stats_catalogue_pas_ij_pas_isup_et_ij$stats_catalogue_partenaire_voeux %>% 
  mutate(`Part du  catalogue`=prop.table(`Demandes tous voeux`)) %>% 
  bind_rows(
    stats_catalogue_pas_ij_pas_isup_et_ij$stats_catalogue_partenaire_voeux %>% 
      filter(Périmètre=="Total")    
  )

stats_catalogue_isup <- NULL

stats_catalogue_isup$stats_catalogue_partenaire <- listeFormationsInserJeunes_finSession2024_01_10_2024_a_transmettre_PS %>% 
  filter(FORMATION_PARAMÉTRÉE=="Paramétrée") %>% 
  mutate(
    `Type diplôme`=case_when(
      str_sub(LIBFORMATION,1,2)=="LP"~"Licence professionnelle",
      str_sub(LIBFORMATION,1,7)=="Licence"~"Licence générale"
    ),
    Filiere=ifelse(APPRENTISSAGEOUSCOLAIRE=="Scolaire","Sco.","App.")
  ) %>% 
  group_by(`Type diplôme`,Filiere) %>% 
  summarise(`Nombre de formations`=n()) %>% 
  mutate(
    `Niveau de formation`="6",
    Périmètre = "InserSup"
  ) %>% 
  left_join(
    listeFormationsInserJeunes_finSession2024_01_10_2024_a_transmettre_PS %>%
      filter(FORMATION_PARAMÉTRÉE=="Paramétrée") %>% 
      mutate(
        `Type diplôme`=case_when(
          str_sub(LIBFORMATION,1,2)=="LP"~"Licence professionnelle",
          str_sub(LIBFORMATION,1,7)=="Licence"~"Licence générale"
        ),
        Filiere=ifelse(APPRENTISSAGEOUSCOLAIRE=="Scolaire","Sco.","App."),
        `Couverture avec code SISE retenu`=ifelse(`Couverture avec code SISE retenu`=="Couvert avec plusieurs SISE","Non couvert",`Couverture avec code SISE retenu`)
      ) %>% 
      group_by(`Type diplôme`,Filiere,`Couverture avec code SISE retenu`) %>% 
      summarise(nb=n()) %>% 
      pivot_wider(names_from = `Couverture avec code SISE retenu` ,values_from = nb) %>% 
      mutate_all(replace_na,0) %>% 
      mutate(
        `Non couvert`=`Non couvert`+`Sous les seuils`
      ) %>% 
      rename(
        "Couverture (nb)"="Couvert" ,
        "Non couvert (nb)"=`Non couvert`,
        "Dont sous le seuil de 20 élèves (nb)" =`Sous les seuils`
      ),
    by=c("Type diplôme","Filiere")
  ) %>% 
  left_join(
    listeFormationsInserJeunes_finSession2024_01_10_2024_a_transmettre_PS %>%
      filter(FORMATION_PARAMÉTRÉE=="Paramétrée") %>% 
      mutate(
        `Type diplôme`=case_when(
          str_sub(LIBFORMATION,1,2)=="LP"~"Licence professionnelle",
          str_sub(LIBFORMATION,1,7)=="Licence"~"Licence générale"
        ),
        Filiere=ifelse(APPRENTISSAGEOUSCOLAIRE=="Scolaire","Sco.","App."),
        `Couverture avec code SISE retenu`=ifelse(`Couverture avec code SISE retenu`=="Couvert avec plusieurs SISE","Non couvert",`Couverture avec code SISE retenu`)
      ) %>% 
      group_by(`Type diplôme`,Filiere,`Couverture avec code SISE retenu`) %>% 
      summarise(part=n()) %>% 
      mutate(
        part=prop.table(part),
      )%>% 
      pivot_wider(names_from = `Couverture avec code SISE retenu` ,values_from = part) %>% 
      mutate_all(replace_na,0) %>% 
      mutate(
        `Non couvert`=`Non couvert`+`Sous les seuils`
      ) %>% 
      rename(
        "Couverture (%)"="Couvert" ,
        "Non couvert (%)"=`Non couvert`,
        "Dont sous le seuil de 20 élèves (%)" =`Sous les seuils`
      ),
    by=c("Type diplôme","Filiere")
  ) %>% 
  left_join(
    listeFormationsInserJeunes_finSession2024_01_10_2024_a_transmettre_PS %>%
      filter(FORMATION_PARAMÉTRÉE=="Paramétrée",`Couverture avec code SISE retenu`=="Couvert") %>% 
      mutate(
        `Type diplôme`=case_when(
          str_sub(LIBFORMATION,1,2)=="LP"~"Licence professionnelle",
          str_sub(LIBFORMATION,1,7)=="Licence"~"Licence générale"
        ),
        Filiere=ifelse(APPRENTISSAGEOUSCOLAIRE=="Scolaire","Sco.","App."),
        uai_type=case_when(
          UAI_GES==UAI_COMPOSANTE ~"Dont couvert par l'UAI lieu de formation (nb)",
          UAI_GES!=UAI_COMPOSANTE ~ "Dont couvert par l'UAI Gestionnaire (nb)"
        )
      ) %>% 
      group_by(`Type diplôme`,Filiere,uai_type) %>% 
      summarise(nb=n()) %>%
      pivot_wider(names_from = uai_type ,values_from = nb) %>% 
      mutate_all(replace_na,0),
    by=c("Type diplôme","Filiere")
  ) %>% 
  mutate(
    "Dont couvert par l'UAI lieu de formation (%)"=`Dont couvert par l'UAI lieu de formation (nb)`/`Nombre de formations` ,
    "Dont couvert par l'UAI Gestionnaire (%)"=`Dont couvert par l'UAI Gestionnaire (nb)`/`Nombre de formations` 
  )



stats_catalogue_isup$stats_catalogue_partenaire_voeux <- listeFormationsInserJeunes_finSession2024_01_10_2024_a_transmettre_PS %>% 
  filter(FORMATION_PARAMÉTRÉE=="Paramétrée") %>% 
  mutate(
    `Type diplôme`=case_when(
      str_sub(LIBFORMATION,1,2)=="LP"~"Licence professionnelle",
      str_sub(LIBFORMATION,1,7)=="Licence"~"Licence générale"
    ),
    Filiere=ifelse(APPRENTISSAGEOUSCOLAIRE=="Scolaire","Sco.","App.")
  ) %>% 
  group_by(`Type diplôme`,Filiere) %>% 
  summarise(`Demandes tous voeux`=sum(NBDEDEMANDES)) %>% 
  mutate(
    `Niveau de formation`="6",
    Périmètre = "InserSup"
  ) %>% 
  left_join(
    listeFormationsInserJeunes_finSession2024_01_10_2024_a_transmettre_PS %>%
      filter(FORMATION_PARAMÉTRÉE=="Paramétrée") %>% 
      mutate(
        `Type diplôme`=case_when(
          str_sub(LIBFORMATION,1,2)=="LP"~"Licence professionnelle",
          str_sub(LIBFORMATION,1,7)=="Licence"~"Licence générale"
        ),
        Filiere=ifelse(APPRENTISSAGEOUSCOLAIRE=="Scolaire","Sco.","App."),
        `Couverture avec code SISE retenu`=ifelse(`Couverture avec code SISE retenu`=="Couvert avec plusieurs SISE","Non couvert",`Couverture avec code SISE retenu`)
      ) %>% 
      group_by(`Type diplôme`,Filiere,`Couverture avec code SISE retenu`) %>% 
      summarise(nb=sum(NBDEDEMANDES)) %>% 
      pivot_wider(names_from = `Couverture avec code SISE retenu` ,values_from = nb) %>% 
      mutate_all(replace_na,0) %>% 
      mutate(
        `Non couvert`=`Non couvert`+`Sous les seuils`
      ) %>% 
      rename(
        "Couverture (nb)"="Couvert" ,
        "Non couvert (nb)"=`Non couvert`,
        "Dont sous le seuil de 20 élèves (nb)" =`Sous les seuils`
      ),
    by=c("Type diplôme","Filiere")
  ) %>% 
  left_join(
    listeFormationsInserJeunes_finSession2024_01_10_2024_a_transmettre_PS %>%
      filter(FORMATION_PARAMÉTRÉE=="Paramétrée") %>% 
      mutate(
        `Type diplôme`=case_when(
          str_sub(LIBFORMATION,1,2)=="LP"~"Licence professionnelle",
          str_sub(LIBFORMATION,1,7)=="Licence"~"Licence générale"
        ),
        Filiere=ifelse(APPRENTISSAGEOUSCOLAIRE=="Scolaire","Sco.","App."),
        `Couverture avec code SISE retenu`=ifelse(`Couverture avec code SISE retenu`=="Couvert avec plusieurs SISE","Non couvert",`Couverture avec code SISE retenu`)
      ) %>% 
      group_by(`Type diplôme`,Filiere,`Couverture avec code SISE retenu`) %>% 
      summarise(part=sum(NBDEDEMANDES)) %>% 
      mutate(
        part=prop.table(part),
      )%>% 
      pivot_wider(names_from = `Couverture avec code SISE retenu` ,values_from = part) %>% 
      mutate_all(replace_na,0) %>% 
      mutate(
        `Non couvert`=`Non couvert`+`Sous les seuils`
      ) %>% 
      rename(
        "Couverture (%)"="Couvert" ,
        "Non couvert (%)"=`Non couvert`,
        "Dont sous le seuil de 20 élèves (%)" =`Sous les seuils`
      ),
    by=c("Type diplôme","Filiere")
  )%>% 
  left_join(
    listeFormationsInserJeunes_finSession2024_01_10_2024_a_transmettre_PS %>%
      filter(FORMATION_PARAMÉTRÉE=="Paramétrée",`Couverture avec code SISE retenu`=="Couvert") %>% 
      mutate(
        `Type diplôme`=case_when(
          str_sub(LIBFORMATION,1,2)=="LP"~"Licence professionnelle",
          str_sub(LIBFORMATION,1,7)=="Licence"~"Licence générale"
        ),
        Filiere=ifelse(APPRENTISSAGEOUSCOLAIRE=="Scolaire","Sco.","App."),
        uai_type=case_when(
          UAI_GES==UAI_COMPOSANTE ~"Dont couvert par l'UAI lieu de formation (nb)",
          UAI_GES!=UAI_COMPOSANTE ~ "Dont couvert par l'UAI Gestionnaire (nb)"
        )
      ) %>% 
      group_by(`Type diplôme`,Filiere,uai_type) %>% 
      summarise(nb=sum(NBDEDEMANDES)) %>%
      pivot_wider(names_from = uai_type ,values_from = nb) %>% 
      mutate_all(replace_na,0),
    by=c("Type diplôme","Filiere")
  ) %>% 
  mutate(
    "Dont couvert par l'UAI lieu de formation (%)"=`Dont couvert par l'UAI lieu de formation (nb)`/`Demandes tous voeux`,
    "Dont couvert par l'UAI Gestionnaire (%)"=`Dont couvert par l'UAI Gestionnaire (nb)`/`Demandes tous voeux`
  )


stats_catalogue_parcoursup_2024_agregation_10_2024_02 <- NULL
stats_catalogue_parcoursup_2024_agregation_10_2024_02$stats_catalogue_partenaire <- bind_rows(
  stats_catalogue_pas_ij_pas_isup_et_ij$stats_catalogue_partenaire,
  stats_catalogue_isup$stats_catalogue_partenaire
)


stats_catalogue_parcoursup_2024_agregation_10_2024_02$stats_catalogue_partenaire <- stats_catalogue_parcoursup_2024_agregation_10_2024_02$stats_catalogue_partenaire %>% 
  filter(`Type diplôme`!="Total") %>% 
  arrange(`Niveau de formation`) %>% 
  mutate(`Part du  catalogue`=prop.table(`Nombre de formations`))

stats_catalogue_parcoursup_2024_agregation_10_2024_02$stats_catalogue_partenaire <- stats_catalogue_parcoursup_2024_agregation_10_2024_02$stats_catalogue_partenaire %>% 
  bind_rows(
    stats_catalogue_parcoursup_2024_agregation_10_2024_02$stats_catalogue_partenaire %>% 
      select_if(is.numeric) %>% 
      summarise_all(sum,na.rm=T) %>% 
      mutate(
        Périmètre = "Total",
        `Niveau de formation`="Total",
        `Type diplôme`="Total",
        Filiere="Total",
        "Couverture (%)"=`Couverture (nb)`/`Nombre de formations`,
        "Formations non associées à une famille de métiers - Formations couvertes (%)"=`Formations non associées à une famille de métiers - Formations couvertes (nb)`/`Nombre de formations`,
        
        "Dont couvert par l'UAI lieu de formation (%)"=`Dont couvert par l'UAI lieu de formation (nb)`/`Nombre de formations`,
        "Dont couvert par l'UAI formateur (%)"=`Dont couvert par l'UAI formateur (nb)`/`Nombre de formations`,
        "Dont couvert par l'UAI Gestionnaire (%)"=`Dont couvert par l'UAI Gestionnaire (nb)`/`Nombre de formations`,
        
        "Non couvert (%)"=`Non couvert (nb)`/`Nombre de formations`,
        "Dont sous le seuil de 20 élèves (%)"=`Dont sous le seuil de 20 élèves (nb)`/`Nombre de formations`,
        "Non couvert - Nouvelles formations (%)"=`Non couvert - Nouvelles formations (nb)`/`Nombre de formations`,
        "Non couvert - code certif inconnu (%)"=`Non couvert - code certif inconnu (nb)`/`Nombre de formations`,
        "Non couvert - Autres ministères certificateurs (%)"=`Non couvert - Autres ministères certificateurs (nb)`/`Nombre de formations`,
        "Non couvert - UAI inconnu (%)"=`Non couvert - UAI inconnu (nb)`/`Nombre de formations`,
        "Territoires mal couverts (%)"=`Territoires mal couverts (nb)`/`Nombre de formations`,
        "Non couvert - Problème de qualité du code formation en entrée (%)"=`Non couvert - Problème de qualité du code formation en entrée (nb)`/`Nombre de formations`,
        "Non couvert - sans raison évidente (%)"=`Non couvert - sans raison évidente (nb)`/`Nombre de formations`
      )
  )  %>% 
  select(c("Périmètre", "Niveau de formation", "Type diplôme", "Filiere", 
           "Nombre de formations", "Part du  catalogue", 
           # "Formations non associées à une famille de métiers (nb)", 
           "Couverture (nb)", "Couverture (%)", 
           # "Formations non associées à une famille de métiers - Formations couvertes (nb)", 
           # "Formations non associées à une famille de métiers - Formations couvertes (%)", 
           # "Formations associées à une famille de métiers - Formations couvertes (%)", 
           
           "Dont couvert par l'UAI lieu de formation (nb)",
           "Dont couvert par l'UAI lieu de formation (%)",
           "Dont couvert par l'UAI formateur (nb)",
           "Dont couvert par l'UAI formateur (%)",
           "Dont couvert par l'UAI Gestionnaire (nb)",
           "Dont couvert par l'UAI Gestionnaire (%)",
           
           "Non couvert (nb)", "Non couvert (%)", "Dont sous le seuil de 20 élèves (nb)", 
           "Dont sous le seuil de 20 élèves (%)", "Non couvert - Nouvelles formations (nb)", 
           "Non couvert - Nouvelles formations (%)", "Non couvert - code certif inconnu (nb)", 
           "Non couvert - code certif inconnu (%)", "Non couvert - Autres ministères certificateurs (nb)", 
           "Non couvert - Autres ministères certificateurs (%)", "Non couvert - UAI inconnu (nb)", 
           "Non couvert - UAI inconnu (%)", 
           
           "Territoires mal couverts (nb)","Territoires mal couverts (%)",
           
           "Non couvert - Problème de qualité du code formation en entrée (nb)", 
           "Non couvert - Problème de qualité du code formation en entrée (%)",
           
           "Non couvert - sans raison évidente (%)",
           "Non couvert - sans raison évidente (nb)"
  ))



stats_catalogue_parcoursup_2024_agregation_10_2024_02$stats_catalogue_partenaire_voeux <- bind_rows(
  stats_catalogue_pas_ij_pas_isup_et_ij$stats_catalogue_partenaire_voeux,
  stats_catalogue_isup$stats_catalogue_partenaire_voeux
)

stats_catalogue_parcoursup_2024_agregation_10_2024_02$stats_catalogue_partenaire_voeux <- stats_catalogue_parcoursup_2024_agregation_10_2024_02$stats_catalogue_partenaire_voeux %>% 
  filter(`Type diplôme`!="Total") %>% 
  arrange(`Niveau de formation`) %>% 
  mutate(`Part du  catalogue`=prop.table(`Demandes tous voeux`))

stats_catalogue_parcoursup_2024_agregation_10_2024_02$stats_catalogue_partenaire_voeux <- stats_catalogue_parcoursup_2024_agregation_10_2024_02$stats_catalogue_partenaire_voeux %>% 
  bind_rows(
    stats_catalogue_parcoursup_2024_agregation_10_2024_02$stats_catalogue_partenaire_voeux %>% 
      select_if(is.numeric) %>% 
      summarise_all(sum,na.rm=T) %>% 
      mutate(
        Périmètre = "Total",
        `Niveau de formation`="Total",
        `Type diplôme`="Total",
        Filiere="Total",
        "Couverture (%)"=`Couverture (nb)`/`Demandes tous voeux`,
        "Formations non associées à une famille de métiers - Effectifs couverts (%)"=`Formations non associées à une famille de métiers - Effectifs couverts (nb)`/`Demandes tous voeux`,
        
        "Dont couvert par l'UAI lieu de formation (%)"=`Dont couvert par l'UAI lieu de formation (nb)`/`Demandes tous voeux`,
        "Dont couvert par l'UAI formateur (%)"=`Dont couvert par l'UAI formateur (nb)`/`Demandes tous voeux`,
        "Dont couvert par l'UAI Gestionnaire (%)"=`Dont couvert par l'UAI Gestionnaire (nb)`/`Demandes tous voeux`,
        
        "Non couvert (%)"=`Non couvert (nb)`/`Demandes tous voeux`,
        "Dont sous le seuil de 20 élèves (%)"=`Dont sous le seuil de 20 élèves (nb)`/`Demandes tous voeux`,
        "Non couvert - Nouvelles formations (%)"=`Non couvert - Nouvelles formations (nb)`/`Demandes tous voeux`,
        "Non couvert - code certif inconnu (%)"=`Non couvert - code certif inconnu (nb)`/`Demandes tous voeux`,
        "Non couvert - Autres ministères certificateurs (%)"=`Non couvert - Autres ministères certificateurs (nb)`/`Demandes tous voeux`,
        "Non couvert - UAI inconnu (%)"=`Non couvert - UAI inconnu (nb)`/`Demandes tous voeux`,
        "Territoires mal couverts (%)"=`Territoires mal couverts (nb)`/`Demandes tous voeux`,
        "Non couvert - Problème de qualité du code formation en entrée (%)"=`Non couvert - Problème de qualité du code formation en entrée (nb)`/`Demandes tous voeux`,
        "Non couvert - sans raison évidente (%)"=`Non couvert - sans raison évidente (nb)`/`Demandes tous voeux`
      )
  ) %>% 
  select(c("Périmètre", "Niveau de formation", "Type diplôme", "Filiere", 
           "Demandes tous voeux", "Part du  catalogue", 
           # "Formations non associées à une famille de métiers (nb)", 
           "Couverture (nb)", "Couverture (%)", 
           # "Formations non associées à une famille de métiers - Effectifs couverts (nb)", 
           # "Formations non associées à une famille de métiers - Effectifs couverts (%)", 
           # "Formations associées à une famille de métiers - Effectifs couverts (%)",
           
           "Dont couvert par l'UAI lieu de formation (nb)",
           "Dont couvert par l'UAI lieu de formation (%)",
           "Dont couvert par l'UAI formateur (nb)",
           "Dont couvert par l'UAI formateur (%)",
           "Dont couvert par l'UAI Gestionnaire (nb)",
           "Dont couvert par l'UAI Gestionnaire (%)",
           
           "Non couvert (nb)", "Non couvert (%)", "Dont sous le seuil de 20 élèves (nb)", 
           "Dont sous le seuil de 20 élèves (%)", "Non couvert - Nouvelles formations (nb)", 
           "Non couvert - Nouvelles formations (%)", "Non couvert - code certif inconnu (nb)", 
           "Non couvert - code certif inconnu (%)", "Non couvert - Autres ministères certificateurs (nb)", 
           "Non couvert - Autres ministères certificateurs (%)", "Non couvert - UAI inconnu (nb)", 
           "Non couvert - UAI inconnu (%)", "Territoires mal couverts (nb)","Territoires mal couverts (%)",
           
           "Non couvert - Problème de qualité du code formation en entrée (nb)", 
           "Non couvert - Problème de qualité du code formation en entrée (%)",
           
           "Non couvert - sans raison évidente (%)",
           "Non couvert - sans raison évidente (nb)"
  ))


correspondance_formation_certificateur <- read_excel(file.path(chemin_racine,"Groupe-002 - Parcoursup/003 - 4 - Prepa ParcourSup 2025/correspondance_formation_certificateur.xlsx"))

stats_catalogue_parcoursup_2024_agregation_10_2024_02$stats_catalogue_partenaire <- stats_catalogue_parcoursup_2024_agregation_10_2024_02$stats_catalogue_partenaire %>% 
  left_join(
    correspondance_formation_certificateur,
    by=c("Niveau de formation","Type diplôme")
  ) %>% 
  select(Périmètre,`Niveau de formation`,`Type diplôme`,Filiere,Certificateur,`Scope 2024`,`Scope 2025`,everything()) %>% 
  mutate(
    `Scope 2024`=case_when(
      !is.na(`Scope 2024`)~`Scope 2024`,
      Périmètre=="Total"~"Total",
      `Niveau de formation` %in% 4:5 & Filiere=="App."~"Oui",
      T~"Non"
    ),
    `Scope 2025`=case_when(
      !is.na(`Scope 2025`)~`Scope 2024`,
      Périmètre=="Total"~"Total",
      `Niveau de formation` %in% 4:5 & Filiere=="App."~"Oui",
      T~"Non"
    ),
    Certificateur=ifelse(Périmètre=="Total","Total",Certificateur)
  )


stats_catalogue_parcoursup_2024_agregation_10_2024_02$stats_catalogue_partenaire_voeux <- stats_catalogue_parcoursup_2024_agregation_10_2024_02$stats_catalogue_partenaire_voeux %>% 
  left_join(
    correspondance_formation_certificateur,
    by=c("Niveau de formation","Type diplôme")
  ) %>% 
  select(Périmètre,`Niveau de formation`,`Type diplôme`,Filiere,Certificateur,`Scope 2024`,`Scope 2025`,everything()) %>% 
  mutate(
    `Scope 2024`=case_when(
      !is.na(`Scope 2024`)~`Scope 2024`,
      Périmètre=="Total"~"Total",
      `Niveau de formation` %in% 4:5 & Filiere=="App."~"Oui",
      T~"Non"
    ),
    `Scope 2025`=case_when(
      !is.na(`Scope 2025`)~`Scope 2024`,
      Périmètre=="Total"~"Total",
      `Niveau de formation` %in% 4:5 & Filiere=="App."~"Oui",
      T~"Non"
    ),
    Certificateur=ifelse(Périmètre=="Total","Total",Certificateur)
  )



stats_catalogue_parcoursup_2024_agregation_10_2024_02_synthese_scope_2024 <- NULL
stats_catalogue_parcoursup_2024_agregation_10_2024_02_synthese_scope_2024$stats_catalogue_partenaire <- stats_catalogue_parcoursup_2024_agregation_10_2024_02$stats_catalogue_partenaire %>%
  filter(Périmètre!="Total") %>%
  group_by(`Scope 2024`,Filiere) %>%
  select_if(is.numeric) %>% 
  summarise_all(sum,na.rm=T) %>%
  mutate(
    "Couverture (%)"=`Couverture (nb)`/`Nombre de formations`,
    
    "Dont couvert par l'UAI lieu de formation (%)"=`Dont couvert par l'UAI lieu de formation (nb)`/`Nombre de formations`,
    "Dont couvert par l'UAI formateur (%)"=`Dont couvert par l'UAI formateur (nb)`/`Nombre de formations`,
    "Dont couvert par l'UAI Gestionnaire (%)"=`Dont couvert par l'UAI Gestionnaire (nb)`/`Nombre de formations`,
    
    "Non couvert (%)"=`Non couvert (nb)`/`Nombre de formations`,
    "Dont sous le seuil de 20 élèves (%)"=`Dont sous le seuil de 20 élèves (nb)`/`Nombre de formations`,
    "Non couvert - Nouvelles formations (%)"=`Non couvert - Nouvelles formations (nb)`/`Nombre de formations`,
    "Non couvert - code certif inconnu (%)"=`Non couvert - code certif inconnu (nb)`/`Nombre de formations`,
    "Non couvert - Autres ministères certificateurs (%)"=`Non couvert - Autres ministères certificateurs (nb)`/`Nombre de formations`,
    "Non couvert - UAI inconnu (%)"=`Non couvert - UAI inconnu (nb)`/`Nombre de formations`,
    "Territoires mal couverts (%)"=`Territoires mal couverts (nb)`/`Nombre de formations`,
    "Non couvert - Problème de qualité du code formation en entrée (%)"=`Non couvert - Problème de qualité du code formation en entrée (nb)`/`Nombre de formations`,
    "Non couvert - sans raison évidente (%)"=`Non couvert - sans raison évidente (nb)`/`Nombre de formations`
  ) %>% 
  select(c("Scope 2024", "Filiere", 
           "Nombre de formations", "Part du  catalogue", 
           "Couverture (nb)", "Couverture (%)", 
           
           "Dont couvert par l'UAI lieu de formation (nb)",
           "Dont couvert par l'UAI lieu de formation (%)",
           "Dont couvert par l'UAI formateur (nb)",
           "Dont couvert par l'UAI formateur (%)",
           "Dont couvert par l'UAI Gestionnaire (nb)",
           "Dont couvert par l'UAI Gestionnaire (%)",
           
           "Non couvert (nb)", "Non couvert (%)", "Dont sous le seuil de 20 élèves (nb)", 
           "Dont sous le seuil de 20 élèves (%)", "Non couvert - Nouvelles formations (nb)", 
           "Non couvert - Nouvelles formations (%)", "Non couvert - code certif inconnu (nb)", 
           "Non couvert - code certif inconnu (%)", "Non couvert - Autres ministères certificateurs (nb)", 
           "Non couvert - Autres ministères certificateurs (%)", "Non couvert - UAI inconnu (nb)", 
           "Non couvert - UAI inconnu (%)", 
           
           "Territoires mal couverts (nb)","Territoires mal couverts (%)",
           
           "Non couvert - Problème de qualité du code formation en entrée (nb)", 
           "Non couvert - Problème de qualité du code formation en entrée (%)",
           
           "Non couvert - sans raison évidente (nb)",
           "Non couvert - sans raison évidente (%)"
  )) %>%
  bind_rows(
    stats_catalogue_parcoursup_2024_agregation_10_2024_02$stats_catalogue_partenaire %>%
      filter(Périmètre=="Total")%>% 
      select(-Périmètre,-`Niveau de formation`,-`Type diplôme`,-Certificateur,-`Scope 2025`)
  )%>%
  ungroup()


stats_catalogue_parcoursup_2024_agregation_10_2024_02_synthese_scope_2024$stats_catalogue_partenaire_voeux <- stats_catalogue_parcoursup_2024_agregation_10_2024_02$stats_catalogue_partenaire_voeux %>%
  filter(Périmètre!="Total") %>%
  group_by(`Scope 2024`,Filiere) %>%
  select_if(is.numeric) %>% 
  summarise_all(sum,na.rm=T) %>%
  mutate(        
    "Couverture (%)"=`Couverture (nb)`/`Demandes tous voeux`,
    
    "Dont couvert par l'UAI lieu de formation (%)"=`Dont couvert par l'UAI lieu de formation (nb)`/`Demandes tous voeux`,
    "Dont couvert par l'UAI formateur (%)"=`Dont couvert par l'UAI formateur (nb)`/`Demandes tous voeux`,
    "Dont couvert par l'UAI Gestionnaire (%)"=`Dont couvert par l'UAI Gestionnaire (nb)`/`Demandes tous voeux`,
    
    "Non couvert (%)"=`Non couvert (nb)`/`Demandes tous voeux`,
    "Dont sous le seuil de 20 élèves (%)"=`Dont sous le seuil de 20 élèves (nb)`/`Demandes tous voeux`,
    "Non couvert - Nouvelles formations (%)"=`Non couvert - Nouvelles formations (nb)`/`Demandes tous voeux`,
    "Non couvert - code certif inconnu (%)"=`Non couvert - code certif inconnu (nb)`/`Demandes tous voeux`,
    "Non couvert - Autres ministères certificateurs (%)"=`Non couvert - Autres ministères certificateurs (nb)`/`Demandes tous voeux`,
    "Non couvert - UAI inconnu (%)"=`Non couvert - UAI inconnu (nb)`/`Demandes tous voeux`,
    "Territoires mal couverts (%)"=`Territoires mal couverts (nb)`/`Demandes tous voeux`,
    "Non couvert - Problème de qualité du code formation en entrée (%)"=`Non couvert - Problème de qualité du code formation en entrée (nb)`/`Demandes tous voeux`,
    "Non couvert - sans raison évidente (%)"=`Non couvert - sans raison évidente (nb)`/`Demandes tous voeux`
  ) %>% 
  select(c("Scope 2024", "Filiere", 
           "Demandes tous voeux", "Part du  catalogue", 
           "Couverture (nb)", "Couverture (%)", 
           
           "Dont couvert par l'UAI lieu de formation (nb)",
           "Dont couvert par l'UAI lieu de formation (%)",
           "Dont couvert par l'UAI formateur (nb)",
           "Dont couvert par l'UAI formateur (%)",
           "Dont couvert par l'UAI Gestionnaire (nb)",
           "Dont couvert par l'UAI Gestionnaire (%)",
           
           "Non couvert (nb)", "Non couvert (%)", "Dont sous le seuil de 20 élèves (nb)", 
           "Dont sous le seuil de 20 élèves (%)", "Non couvert - Nouvelles formations (nb)", 
           "Non couvert - Nouvelles formations (%)", "Non couvert - code certif inconnu (nb)", 
           "Non couvert - code certif inconnu (%)", "Non couvert - Autres ministères certificateurs (nb)", 
           "Non couvert - Autres ministères certificateurs (%)", "Non couvert - UAI inconnu (nb)", 
           "Non couvert - UAI inconnu (%)", 
           
           "Territoires mal couverts (nb)","Territoires mal couverts (%)",
           
           "Non couvert - Problème de qualité du code formation en entrée (nb)", 
           "Non couvert - Problème de qualité du code formation en entrée (%)",
           
           "Non couvert - sans raison évidente (nb)",
           "Non couvert - sans raison évidente (%)"
  )) %>%
  bind_rows(
    stats_catalogue_parcoursup_2024_agregation_10_2024_02$stats_catalogue_partenaire_voeux %>%
      filter(Périmètre=="Total")%>% 
      select(-Périmètre,-`Niveau de formation`,-`Type diplôme`,-Certificateur,-`Scope 2025`)
  )%>%
  ungroup()

#Le sup semble couvert sur l'établissement gestionnaire: https://dossier.parcoursup.fr/Candidats/public/fiches/afficherFicheFormation?g_ta_cod=24415
#
#Université de Montpellier, Antenne de Perpignan (66)
#https://data.enseignementsup-recherche.gouv.fr/explore/dataset/fr-esr-insersup/information/?flg=fr-fr&disjunctive.source&disjunctive.reg_id&disjunctive.aca_id&disjunctive.id_paysage&disjunctive.id_paysage_actuel&disjunctive.etablissement&disjunctive.type_diplome&disjunctive.dom&disjunctive.discipli&disjunctive.sectdis&disjunctive.diplome&disjunctive.date_inser&sort=-promo&q=0660922U
#https://data.enseignementsup-recherche.gouv.fr/explore/dataset/fr-esr-insersup/table/?flg=fr-fr&disjunctive.source&disjunctive.reg_id&disjunctive.aca_id&disjunctive.id_paysage&disjunctive.id_paysage_actuel&disjunctive.etablissement&disjunctive.type_diplome&disjunctive.dom&disjunctive.discipli&disjunctive.sectdis&disjunctive.diplome&disjunctive.date_inser&refine.etablissement=0342490X&sort=-promo&refine.diplome=2300044
#
#Université Panthéon- Assas Paris2 - Antenne Melun  
#https://dossier.parcoursup.fr/Candidats/public/fiches/afficherFicheFormation?g_ta_cod=9913
#https://data.enseignementsup-recherche.gouv.fr/explore/dataset/fr-esr-insersup/table/?flg=fr-fr&disjunctive.source&disjunctive.reg_id&disjunctive.aca_id&disjunctive.id_paysage&disjunctive.id_paysage_actuel&disjunctive.etablissement&disjunctive.type_diplome&disjunctive.dom&disjunctive.discipli&disjunctive.sectdis&disjunctive.diplome&disjunctive.date_inser&refine.etablissement=0756305W&sort=-promo&refine.diplome=2300002
#https://data.enseignementsup-recherche.gouv.fr/explore/dataset/fr-esr-insersup/table/?flg=fr-fr&disjunctive.source&disjunctive.reg_id&disjunctive.aca_id&disjunctive.id_paysage&disjunctive.id_paysage_actuel&disjunctive.etablissement&disjunctive.type_diplome&disjunctive.dom&disjunctive.discipli&disjunctive.sectdis&disjunctive.diplome&disjunctive.date_inser&refine.etablissement=0772448T&sort=-promo&refine.diplome=2300002
#
#Après vérification, aucun uai des 131 antennes présentes dans PS n'ont de stats pour leurs UAI (91 antennes ont des stats en remontant au gestionnaire)
listeFormationsInserJeunes_finSession2024_01_10_2024_a_transmettre_PS %>%
  filter(FORMATION_PARAMÉTRÉE=="Paramétrée") %>% 
  filter(UAI_GES!=UAI_COMPOSANTE) %>% 
  mutate(
    `Type diplôme`=case_when(
      str_sub(LIBFORMATION,1,2)=="LP"~"Licence professionnelle",
      str_sub(LIBFORMATION,1,7)=="Licence"~"Licence générale"
    ),
    Filiere=ifelse(APPRENTISSAGEOUSCOLAIRE=="Scolaire","Sco.","App.")
  ) %>% 
  distinct(UAI_COMPOSANTE) %>% 
  filter(UAI_COMPOSANTE %in% 
           (  data_meta_formationsStats_init %>% 
                filter(filiere=="superieur") %>% 
                distinct(uai) %>% 
                pull(uai)))

