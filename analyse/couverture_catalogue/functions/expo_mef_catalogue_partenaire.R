expo_mef_catalogue_partenaire <- function(catalogue_init,type_source="affelnet"){
  
  if( type_source %in% c("onisep","affelnet") ){
    catalogue_partenaire_renseigne <- catalogue_init %>% 
      left_join(
        famillemetiers_2024 %>% 
          select(`MEFSTAT11 2DE PRO Affelnet`,`MEFSTAT11 TERMINALE PRO IJ`,`Famille de métiers`),
        by=c("MEFSTAT11"="MEFSTAT11 2DE PRO Affelnet")
      ) %>% 
      left_join(
        n_mef %>%
          filter(year(as.Date(DATE_FERMETURE,format="%d/%m/%Y"))>2024 | is.na(DATE_FERMETURE)) %>%
          filter(year(as.Date(DATE_OUVERTURE,format="%d/%m/%Y"))<=2024 | is.na(DATE_OUVERTURE)) %>%
          distinct(MEF_STAT_11,FORMATION_DIPLOME,DUREE_DISPOSITIF),
        by=c("MEFSTAT11"="MEF_STAT_11")
      ) %>% 
      mutate(
        MEFSTAT11_annee_terminale = case_when(
          type_source=="affelnet"~ paste0(
            str_sub(MEFSTAT11, 1, 3),
            DUREE_DISPOSITIF,
            str_sub(MEFSTAT11, 5, 11)
          ),
          type_source=="onisep" & Filiere=="Apprentissage" ~ NA,
          type_source=="onisep" & Filiere=="Scolaire" ~ MEFSTAT11
        ),
        FORMATION_DIPLOME = case_when(
          type_source=="affelnet"~ FORMATION_DIPLOME,
          type_source=="onisep" & Filiere=="Apprentissage" ~ MEFSTAT11,
          type_source=="onisep" & Filiere=="Scolaire" ~FORMATION_DIPLOME
        ), 
        famillemetiers=case_when(
          Filiere=="Apprentissage"~"Hors famille de métiers",
          MEFSTAT11%in%famillemetiers_2024$`MEFSTAT11 2DE PRO Affelnet` ~ "Famille de métiers",
          T~"Hors famille de métiers"),
        MEFSTAT11_annee_terminale=ifelse(is.na(`Famille de métiers`),MEFSTAT11_annee_terminale,`MEFSTAT11 TERMINALE PRO IJ`),
        code_certification=ifelse(Filiere=="Scolaire",MEFSTAT11_annee_terminale,FORMATION_DIPLOME ))  %>% 
      select(-`MEFSTAT11 TERMINALE PRO IJ`,-`Famille de métiers`) %>% 
      distinct(across(names(catalogue_init)),
               MEFSTAT11_annee_terminale,
               code_certification,
               famillemetiers,
               FORMATION_DIPLOME) %>% 
      left_join(
        n_mef %>%
          filter(year(as.Date(DATE_FERMETURE,format="%d/%m/%Y"))>2024 | is.na(DATE_FERMETURE)) %>%
          filter(year(as.Date(DATE_OUVERTURE,format="%d/%m/%Y"))<=2024 | is.na(DATE_OUVERTURE)) %>%
          distinct(MEF_STAT_11,FORMATION_DIPLOME) %>% 
          rename(FORMATION_DIPLOME_annee_terminale=FORMATION_DIPLOME),
        by=c("MEFSTAT11_annee_terminale"="MEF_STAT_11")
      ) %>%
      left_join(
        n_formation_diplome %>%
          select(FORMATION_DIPLOME,NIVEAU_FORMATION_DIPLOME,GROUPE_SPECIALITE,LETTRE_SPECIALITE,LIBELLE_COURT,LIBELLE_LONG_200,LIBELLE_STAT_33),
        by="FORMATION_DIPLOME"
      ) %>%  
      left_join(
        n_niveau_formation_diplome %>% 
          select(NIVEAU_FORMATION_DIPLOME,NIVEAU_QUALIFICATION_RNCP),
        by="NIVEAU_FORMATION_DIPLOME"
      ) %>% 
      left_join(
        ensemble_data_formationsStats %>%
          select(-`Clé ministere educatif`,-NIVEAU_FORMATION_DIPLOME,-code_formation_diplome,-niveau_diplome,-NIVEAU_QUALIFICATION_RNCP) %>%
          distinct(),
        by=c("UAI","code_certification")) %>% 
      group_by(across(names(catalogue_init)),famillemetiers,FORMATION_DIPLOME,NIVEAU_FORMATION_DIPLOME,NIVEAU_QUALIFICATION_RNCP,LIBELLE_COURT) %>% 
      nest() %>% 
      mutate(
        type_formation=case_when(
          as.numeric(NIVEAU_QUALIFICATION_RNCP)%in%0:4 ~ "Avant le bac",
          as.numeric(NIVEAU_QUALIFICATION_RNCP)%in%5:8 ~ "Après le bac",
          is.na(NIVEAU_QUALIFICATION_RNCP)|NIVEAU_QUALIFICATION_RNCP==99~"Inconnu"
        ),
        type_formation=factor(type_formation,levels=c("Avant le bac","Après le bac","Inconnu")),
        libelle_type_diplome=case_when(
          str_detect(LIBELLE_COURT,"DIP3-CNAM")~"Titre professionnel homologué",
          str_detect(LIBELLE_COURT,"TH3")~"Titre professionnel homologué",
          str_detect(LIBELLE_COURT,"TH4")~"Titre professionnel homologué",
          str_detect(LIBELLE_COURT,"TH5")~"Titre professionnel homologué",
          str_detect(LIBELLE_COURT,"DIV-2")~"Autres diplômes",
          str_detect(LIBELLE_COURT,"DIV-3")~"Autres diplômes",
          str_detect(LIBELLE_COURT,"DIV-4")~"Autres diplômes",
          str_detect(LIBELLE_COURT,"DIV-5")~"Autres diplômes",
          str_detect(LIBELLE_COURT,"BPA")~"BPA",
          str_detect(LIBELLE_COURT,"CSA")~"CSA",
          str_detect(LIBELLE_COURT,"CS")~"CS",
          str_detect(LIBELLE_COURT,"ASSIMI.BTS")~"BTS",
          type_formation=="Inconnu"~"Inconnu",
          T~LIBELLE_COURT
        )) %>% 
      ungroup()    
    
    catalogue_partenaire_renseigne <- catalogue_init %>% 
      left_join(catalogue_partenaire_renseigne,
                by=names(catalogue_init))
    
    
    catalogue_partenaire_renseigne <-catalogue_partenaire_renseigne  %>% 
      mutate(Couvert=map_lgl(data,~any(.$Couverture=="Couvert")),
             Sous_seuil=map_lgl(data,~any(.$Couverture=="Sous le seuil de 20 élèves")),
             Non_couvert=map_lgl(data,~all(is.na(.$Couverture)))
      ) %>% 
      mutate(
        Couverture=case_when(
          Couvert~"Couvert",
          Sous_seuil~"Sous le seuil de 20 élèves",
          TRUE~"Non couvert"
        )
      ) %>% 
      select(-Couvert,-Sous_seuil,-Non_couvert) %>% 
      mutate(
        type_uai_lieu_formation=map_lgl(data,~any(.$uai_donnee_type=="lieu_formation")),
        type_uai_formateur=map_lgl(data,~any(.$uai_donnee_type=="formateur")),
        type_uai_gestionnaire=map_lgl(data,~any(.$uai_donnee_type=="gestionnaire")),
        type_uai_inconnu=map_lgl(data,~any(.$uai_donnee_type=="inconnu"))
      ) %>% 
      mutate(
        type_uai=case_when(
          type_uai_lieu_formation ~"UAI Lieu formation - Couvert + sous le seuil",
          type_uai_formateur~"UAI Formateur - Couvert + sous le seuil",
          type_uai_gestionnaire~"UAI Gestionnaire - Couvert + sous le seuil",
          type_uai_inconnu~"Inconnu",
          TRUE~"Non couvert"
        )
      ) %>% 
      select(-type_uai_lieu_formation,-type_uai_formateur,-type_uai_gestionnaire,-type_uai_inconnu) %>% 
      left_join(
        catalogue_partenaire_renseigne %>% 
          unnest() %>%
          left_join(
            opendata_certif_info %>%
              filter(!is.na(Code_Scolarité)) %>%
              distinct(Code_Scolarité,valideur,certificateur),
            by=c("FORMATION_DIPLOME_annee_terminale"="Code_Scolarité")
          ) %>% 
          mutate(
            certificateur_annee_terminale=case_when(
              str_detect(str_to_lower(certificateur),"enseignement superieur")~"Ministère de l'enseignement supérieur et de la recherche",
              str_detect(str_to_lower(certificateur),"agriculture")~"Ministère de l'agriculture",
              str_detect(str_to_lower(certificateur),"éducation nationale")~"Ministère de l'éducation nationale",
              # Filiere=="Scolaire"~"Ministère de l'éducation nationale",
              certificateur==""~NA,
              T~certificateur
            ),
            valideur_annee_terminale=case_when(
              str_detect(str_to_lower(valideur),"enseignement superieur")~"Ministère de l'enseignement supérieur et de la recherche",
              str_detect(str_to_lower(valideur),"agriculture")~"Ministère de l'agriculture",
              str_detect(str_to_lower(valideur),"éducation nationale")~"Ministère de l'éducation nationale",
              # Filiere=="Scolaire"~"Ministère de l'éducation nationale",
              valideur==""~NA,
              T~valideur
            )
          ) %>% 
          distinct(across(names(catalogue_init)), famillemetiers, FORMATION_DIPLOME,NIVEAU_FORMATION_DIPLOME, LIBELLE_COURT, NIVEAU_QUALIFICATION_RNCP, type_formation, libelle_type_diplome,certificateur_annee_terminale,valideur_annee_terminale)  %>% 
          left_join(
            opendata_certif_info %>% 
              filter(!is.na(Code_Scolarité)) %>% 
              distinct(Code_Scolarité,valideur,certificateur),
            by=c("FORMATION_DIPLOME"="Code_Scolarité")
          ) %>% 
          mutate(
            certificateur=case_when(
              str_detect(str_to_lower(certificateur),"enseignement superieur")~"Ministère de l'enseignement supérieur et de la recherche",
              str_detect(str_to_lower(certificateur),"agriculture")~"Ministère de l'agriculture",
              str_detect(str_to_lower(certificateur),"éducation nationale")~"Ministère de l'éducation nationale",
              # Filiere=="Scolaire"~"Ministère de l'éducation nationale"
              certificateur==""~NA,
              T~certificateur
            ),
            certificateur=case_when(
              !is.na(certificateur)~certificateur,
              T~certificateur_annee_terminale
            ),
            valideur=case_when(
              str_detect(str_to_lower(valideur),"enseignement superieur")~"Ministère de l'enseignement supérieur et de la recherche",
              str_detect(str_to_lower(valideur),"agriculture")~"Ministère de l'agriculture",
              str_detect(str_to_lower(valideur),"éducation nationale")~"Ministère de l'éducation nationale",
              # Filiere=="Scolaire"~"Ministère de l'éducation nationale",
              valideur==""~NA,
              T~valideur
            ),
            valideur=case_when(
              !is.na(valideur)~valideur,
              T~valideur_annee_terminale
            ),
            certificateur_valideur=case_when(
              !is.na(certificateur)~certificateur,
              T~valideur
            ),
            certificateur_valideur_simpli=case_when(
              str_detect(certificateur_valideur,"Ministère de l'agriculture")|str_detect(certificateur_valideur,"Ministère de l'éducation nationale")~"Ministère de l'éducation nationale ou Ministère de l'agriculture",
              T~"Autres ministères certificateurs"
            ),
            certificateur_valideur_simpli=factor(certificateur_valideur_simpli,levels = c("Ministère de l'éducation nationale ou Ministère de l'agriculture","Autres ministères certificateurs"))
          ) %>% 
          group_by(across(names(catalogue_init))) %>% 
          filter(as.numeric(certificateur_valideur_simpli)==min(as.numeric(certificateur_valideur_simpli)))%>% 
          distinct(across(names(catalogue_init)), certificateur_valideur_simpli),
        by=names(catalogue_init)
      ) %>% 
      left_join(
        ACCE_UAI %>% 
          distinct(numero_uai,academie),
        by=c("UAI"="numero_uai")
      ) %>% 
      mutate(
        type_territoire = case_when(
          str_sub(academie,1,1)=="4"~"Territoire mal couvert",
          T ~ "Territoire normalement couvert"
        )
      ) %>% 
      select(-academie) %>% 
      left_join(
        n_formation_diplome %>% 
          # mutate(Nouvelle_formation=ifelse(is.na(ANCIEN_DIPLOME_1),T,F)) %>% 
          mutate(
            Nouvelle_formation=case_when(
              DATE_PREMIERE_SESSION>2022~T,
              T~F)
          ) %>% 
          distinct(FORMATION_DIPLOME,Nouvelle_formation),
        by="FORMATION_DIPLOME"
      ) %>%  
      left_join(
        ACCE_UAI %>% 
          distinct(numero_uai) %>% 
          mutate(presence_UAI_ACCE=T),
        by=c("UAI"="numero_uai")
      ) %>%
      left_join(
        unnest(.) %>% 
          distinct(famillemetiers,FORMATION_DIPLOME,FORMATION_DIPLOME_annee_terminale) %>% 
          mutate(FORMATION_DIPLOME_annee_terminale=ifelse(famillemetiers=="Hors famille de métiers",FORMATION_DIPLOME,FORMATION_DIPLOME_annee_terminale)) %>% 
          left_join(
            n_mef %>% 
              mutate(MEF_STAT_9_annee_terminale=paste0(str_sub(MEF_STAT_9,1,3),DUREE_DISPOSITIF,str_sub(MEF_STAT_9,5,9))) %>% 
              select(FORMATION_DIPLOME,MEF_STAT_9_annee_terminale) %>% 
              left_join(
                n_mef %>% 
                  select(FORMATION_DIPLOME,MEF_STAT_9) %>% 
                  rename(FORMATION_DIPLOME_annee_terminale_ok=FORMATION_DIPLOME),
                by=c("MEF_STAT_9_annee_terminale"="MEF_STAT_9")
              ) %>% 
              distinct(FORMATION_DIPLOME,FORMATION_DIPLOME_annee_terminale_ok),
            by=c("FORMATION_DIPLOME_annee_terminale"="FORMATION_DIPLOME")
          ) %>% 
          left_join(
            opendata_certif_info %>% 
              filter(!is.na(Code_Scolarité)) %>% 
              distinct(Code_Scolarité) %>% 
              mutate(presence_Code_Scolarité_certif_info=T),
            by=c("FORMATION_DIPLOME_annee_terminale_ok"="Code_Scolarité")
          )  %>% 
          filter(presence_Code_Scolarité_certif_info)  %>% 
          distinct(FORMATION_DIPLOME,presence_Code_Scolarité_certif_info),
        by="FORMATION_DIPLOME"
      ) %>% 
      mutate(scope=case_when(
        (!is.na(presence_UAI_ACCE) & !(!Nouvelle_formation & is.na(presence_Code_Scolarité_certif_info)) & !Nouvelle_formation & type_territoire !="Territoire mal couvert"& certificateur_valideur_simpli=="Ministère de l'éducation nationale ou Ministère de l'agriculture")~T,
        T~F)
      )
  }else if( type_source %in% c("superieur") ){
    
    catalogue_partenaire_renseigne <-catalogue_init %>% 
      filter(!is.na(CODESISE)) %>%
      mutate(
        code_certification=CODESISE
      ) %>% 
      distinct() %>% 
      left_join(
        ensemble_data_formationsStats %>%
          select(-`Clé ministere educatif`,-NIVEAU_FORMATION_DIPLOME,-code_formation_diplome,-niveau_diplome,-NIVEAU_QUALIFICATION_RNCP) %>%
          distinct(),
        by=c("UAI","code_certification","Filiere"="filiere"))  %>% 
      # group_by(across(setdiff(names(catalogue_init),"CODESISE"))) %>% 
      group_by(across(setdiff(names(catalogue_init),c("MEFSTAT11_annee_terminale", "FORMATION_DIPLOME_annee_terminale", 
                                                      "GROUPE_SPECIALITE", "LETTRE_SPECIALITE", "LIBELLE_LONG_200", 
                                                      "LIBELLE_STAT_33", "filiere","CODESISE")))) %>%
      nest() %>% 
      ungroup()    
    
    
    catalogue_partenaire_renseigne <- catalogue_init %>% 
      distinct(across(setdiff(names(catalogue_init),c("MEFSTAT11_annee_terminale", "FORMATION_DIPLOME_annee_terminale", 
                                                      "GROUPE_SPECIALITE", "LETTRE_SPECIALITE", "LIBELLE_LONG_200", 
                                                      "LIBELLE_STAT_33", "filiere","CODESISE")))) %>% 
      left_join(catalogue_partenaire_renseigne,
                by=setdiff(names(catalogue_init),c("MEFSTAT11_annee_terminale", "FORMATION_DIPLOME_annee_terminale", 
                                                   "GROUPE_SPECIALITE", "LETTRE_SPECIALITE", "LIBELLE_LONG_200", 
                                                   "LIBELLE_STAT_33", "filiere","CODESISE"))) %>% 
      mutate(type_formation="Après le bac",
             type_formation=factor(type_formation,levels=c("Avant le bac","Après le bac","Inconnu")),
             libelle_type_diplome=str_split_fixed(LIBELLE_COURT," - ",n=2)[,1]
      )
    
    
    catalogue_partenaire_renseigne <- catalogue_partenaire_renseigne  %>% 
      mutate(Couvert=map_lgl(data,~any(.$Couverture=="Couvert")),
             Sous_seuil=map_lgl(data,~any(.$Couverture=="Sous le seuil de 20 élèves")),
             Non_couvert=map_lgl(data,~all(is.na(.$Couverture)))
      ) %>% 
      mutate(
        Couverture=case_when(
          Couvert~"Couvert",
          Sous_seuil~"Sous le seuil de 20 élèves",
          TRUE~"Non couvert"
        )
      ) %>% 
      select(-Couvert,-Sous_seuil,-Non_couvert) %>% 
      mutate(
        type_uai_lieu_formation=map_lgl(data,~any(.$uai_donnee_type=="lieu_formation")),
        type_uai_formateur=map_lgl(data,~any(.$uai_donnee_type=="formateur")),
        type_uai_gestionnaire=map_lgl(data,~any(.$uai_donnee_type=="gestionnaire")),
        type_uai_inconnu=map_lgl(data,~any(.$uai_donnee_type=="inconnu"))
      ) %>% 
      mutate(
        type_uai=case_when(
          type_uai_lieu_formation ~"UAI Lieu formation - Couvert + sous le seuil",
          type_uai_formateur~"UAI Formateur - Couvert + sous le seuil",
          type_uai_gestionnaire~"UAI Gestionnaire - Couvert + sous le seuil",
          type_uai_inconnu~"Inconnu",
          TRUE~"Non couvert"
        )
      ) %>% 
      select(-type_uai_lieu_formation,-type_uai_formateur,-type_uai_gestionnaire,-type_uai_inconnu) %>% 
      left_join(
        catalogue_partenaire_renseigne %>% 
          unnest() %>%
          left_join(
            opendata_certif_info %>%
              filter(!is.na(Code_Scolarité)) %>%
              distinct(Code_Scolarité,valideur,certificateur),
            by=c("FORMATION_DIPLOME_annee_terminale"="Code_Scolarité")
          ) %>% 
          mutate(
            certificateur_annee_terminale=case_when(
              str_detect(str_to_lower(certificateur),"enseignement superieur")~"Ministère de l'enseignement supérieur et de la recherche",
              str_detect(str_to_lower(certificateur),"agriculture")~"Ministère de l'agriculture",
              str_detect(str_to_lower(certificateur),"éducation nationale")~"Ministère de l'éducation nationale",
              # Filiere=="Scolaire"~"Ministère de l'éducation nationale",
              certificateur==""~NA,
              T~certificateur
            ),
            valideur_annee_terminale=case_when(
              str_detect(str_to_lower(valideur),"enseignement superieur")~"Ministère de l'enseignement supérieur et de la recherche",
              str_detect(str_to_lower(valideur),"agriculture")~"Ministère de l'agriculture",
              str_detect(str_to_lower(valideur),"éducation nationale")~"Ministère de l'éducation nationale",
              # Filiere=="Scolaire"~"Ministère de l'éducation nationale",
              valideur==""~NA,
              T~valideur
            )
          ) %>% 
          distinct(across(names(catalogue_init)), famillemetiers, FORMATION_DIPLOME,NIVEAU_FORMATION_DIPLOME, LIBELLE_COURT, NIVEAU_QUALIFICATION_RNCP, type_formation, libelle_type_diplome,certificateur_annee_terminale,valideur_annee_terminale)  %>% 
          left_join(
            opendata_certif_info %>% 
              filter(!is.na(Code_Scolarité)) %>% 
              distinct(Code_Scolarité,valideur,certificateur),
            by=c("FORMATION_DIPLOME"="Code_Scolarité")
          ) %>% 
          mutate(
            certificateur=case_when(
              str_detect(str_to_lower(certificateur),"enseignement superieur")~"Ministère de l'enseignement supérieur et de la recherche",
              str_detect(str_to_lower(certificateur),"agriculture")~"Ministère de l'agriculture",
              str_detect(str_to_lower(certificateur),"éducation nationale")~"Ministère de l'éducation nationale",
              # Filiere=="Scolaire"~"Ministère de l'éducation nationale"
              certificateur==""~NA,
              T~certificateur
            ),
            certificateur=case_when(
              !is.na(certificateur)~certificateur,
              T~certificateur_annee_terminale
            ),
            valideur=case_when(
              str_detect(str_to_lower(valideur),"enseignement superieur")~"Ministère de l'enseignement supérieur et de la recherche",
              str_detect(str_to_lower(valideur),"agriculture")~"Ministère de l'agriculture",
              str_detect(str_to_lower(valideur),"éducation nationale")~"Ministère de l'éducation nationale",
              # Filiere=="Scolaire"~"Ministère de l'éducation nationale",
              valideur==""~NA,
              T~valideur
            ),
            valideur=case_when(
              !is.na(valideur)~valideur,
              T~valideur_annee_terminale
            ),
            certificateur_valideur=case_when(
              !is.na(certificateur)~certificateur,
              T~valideur
            ),
            certificateur_valideur_simpli=case_when(
              str_detect(certificateur_valideur,"Ministère de l'agriculture")|str_detect(certificateur_valideur,"Ministère de l'éducation nationale")~"Ministère de l'éducation nationale ou Ministère de l'agriculture",
              T~"Autres ministères certificateurs"
            ),
            certificateur_valideur_simpli=factor(certificateur_valideur_simpli,levels = c("Ministère de l'éducation nationale ou Ministère de l'agriculture","Autres ministères certificateurs"))
          ) %>% 
          group_by(across(setdiff(names(catalogue_init),c("MEFSTAT11_annee_terminale", "FORMATION_DIPLOME_annee_terminale","GROUPE_SPECIALITE", "LETTRE_SPECIALITE", "LIBELLE_LONG_200","LIBELLE_STAT_33", "filiere","CODESISE")))) %>% 
          filter(as.numeric(certificateur_valideur_simpli)==min(as.numeric(certificateur_valideur_simpli)))%>% 
          distinct(across(setdiff(names(catalogue_init),c("MEFSTAT11_annee_terminale", "FORMATION_DIPLOME_annee_terminale","GROUPE_SPECIALITE", "LETTRE_SPECIALITE", "LIBELLE_LONG_200","LIBELLE_STAT_33", "filiere","CODESISE"))), certificateur_valideur_simpli),
        by=setdiff(names(catalogue_init),c("MEFSTAT11_annee_terminale", "FORMATION_DIPLOME_annee_terminale","GROUPE_SPECIALITE", "LETTRE_SPECIALITE", "LIBELLE_LONG_200","LIBELLE_STAT_33", "filiere","CODESISE"))
      ) %>% 
      left_join(
        ACCE_UAI %>% 
          distinct(numero_uai,academie),
        by=c("UAI"="numero_uai")
      ) %>% 
      mutate(
        type_territoire = case_when(
          str_sub(academie,1,1)=="4"~"Territoire mal couvert",
          T ~ "Territoire normalement couvert"
        )
      ) %>% 
      select(-academie) %>% 
      left_join(
        n_formation_diplome %>% 
          # mutate(Nouvelle_formation=ifelse(is.na(ANCIEN_DIPLOME_1),T,F)) %>% 
          mutate(
            Nouvelle_formation=case_when(
              DATE_PREMIERE_SESSION>2022~T,
              T~F)
          ) %>% 
          distinct(FORMATION_DIPLOME,Nouvelle_formation),
        by="FORMATION_DIPLOME"
      ) %>%  
      left_join(
        ACCE_UAI %>% 
          distinct(numero_uai) %>% 
          mutate(presence_UAI_ACCE=T),
        by=c("UAI"="numero_uai")
      ) %>% 
      left_join(
        opendata_certif_info %>% 
          filter(!is.na(Code_Scolarité)) %>% 
          distinct(Code_Scolarité) %>% 
          mutate(presence_Code_Scolarité_certif_info=T),
        by=c("FORMATION_DIPLOME"="Code_Scolarité")
      )  %>% 
      mutate(
        scope=case_when(
          (!is.na(presence_UAI_ACCE) & !(!Nouvelle_formation & is.na(presence_Code_Scolarité_certif_info)) & !Nouvelle_formation & type_territoire !="Territoire mal couvert"& certificateur_valideur_simpli=="Ministère de l'éducation nationale ou Ministère de l'agriculture")~T,
          T~F)
      )

  }
  
  
  catalogue_partenaire_renseigne <- catalogue_partenaire_renseigne %>% 
    mutate(
      famillemetiers=ifelse(is.na(famillemetiers),"Hors famille de métiers",famillemetiers)
    )
  

  
  return(catalogue_partenaire_renseigne)
} 

expo_mef_stats_catalogue_partenaire <- function(catalogue_partenaire_renseigne,type_source="ij",type_voeux="affelnet"){
  #Stats formations ----
  ##stats_catalogue_partenaire ----
  
  stats_catalogue_partenaire <- catalogue_partenaire_renseigne %>%
    select(UAI,MEFSTAT11,famillemetiers,FORMATION_DIPLOME,Filiere,NIVEAU_FORMATION_DIPLOME,LIBELLE_COURT,NIVEAU_QUALIFICATION_RNCP,type_formation,libelle_type_diplome) %>% 
    ungroup() %>% 
    group_by(type_formation,libelle_type_diplome,Filiere) %>% 
    summarise("Nombre de formations"=n()) %>% 
    ungroup() %>% 
    mutate("Part du  catalogue"=prop.table(`Nombre de formations`)) %>% 
    left_join(
      catalogue_partenaire_renseigne %>%
        select(UAI,MEFSTAT11,famillemetiers,FORMATION_DIPLOME,Filiere,NIVEAU_FORMATION_DIPLOME,LIBELLE_COURT,NIVEAU_QUALIFICATION_RNCP,type_formation,libelle_type_diplome) %>% 
        group_by(type_formation,libelle_type_diplome,Filiere,famillemetiers) %>% 
        summarise(`Nombre de formations`=n()) %>% 
        ungroup() %>% 
        left_join(
          catalogue_partenaire_renseigne %>% 
            filter(Couverture=="Couvert")%>%   
            group_by(type_formation,libelle_type_diplome,Filiere,famillemetiers) %>% 
            summarise("Nombre de formations couvertes"=n()),
          by=c("type_formation","libelle_type_diplome","Filiere","famillemetiers")
        ) %>% 
        mutate(
          famillemetiers=ifelse(is.na(famillemetiers),"Hors famille de métiers",famillemetiers),
          `Nombre de formations couvertes`=replace_na(`Nombre de formations couvertes`,0),
          Couverture=`Nombre de formations couvertes`/`Nombre de formations`
        ) %>% 
        pivot_longer(
          cols = c(`Nombre de formations`,`Nombre de formations couvertes`,Couverture)
        ) %>% 
        mutate(
          name=case_when(
            name == "Nombre de formations" ~ paste0(famillemetiers," (nb)"),
            name == "Nombre de formations couvertes" ~ paste0(famillemetiers," - Formations couvertes (nb)"),
            name == "Couverture" ~ paste0(famillemetiers," - Formations couvertes (%)")
          )
        ) %>% 
        select(-famillemetiers) %>% 
        mutate(
          name=factor(name,
                      levels=c("Famille de métiers (nb)", 
                               "Famille de métiers - Formations couvertes (nb)", "Famille de métiers - Formations couvertes (%)",
                               "Hors famille de métiers (nb)", "Hors famille de métiers - Formations couvertes (nb)",
                               "Hors famille de métiers - Formations couvertes (%)"
                      ),
                      labels=c("Formations associées à une famille de métiers (nb)", 
                               "Formations associées à une famille de métiers - Formations couvertes (nb)", 
                               "Formations associées à une famille de métiers - Formations couvertes (%)",
                               "Formations non associées à une famille de métiers (nb)", 
                               "Formations non associées à une famille de métiers - Formations couvertes (nb)",
                               "Formations non associées à une famille de métiers - Formations couvertes (%)"
                      )
          )
        ) %>% 
        pivot_wider(names_from = name,values_from = value) ,
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        group_by(type_formation,libelle_type_diplome,Filiere,Couverture) %>% 
        summarise(nb=n()) %>% 
        mutate(part=prop.table(nb)) %>% 
        pivot_longer(cols = c(nb,part)) %>% 
        mutate(Couverture=case_when(
          name=="nb"~paste0(Couverture," (nb)"),
          name=="part"~paste0(Couverture," (%)")
        )) %>% 
        select(-name) %>% 
        pivot_wider(names_from = Couverture,values_from = value) %>% 
        mutate_all(replace_na,0,) %>% 
        mutate(`Non couvert (nb)`=`Non couvert (nb)`+`Sous le seuil de 20 élèves (nb)`,
               `Non couvert (%)`=`Non couvert (%)`+`Sous le seuil de 20 élèves (%)`),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(catalogue_partenaire_renseigne %>% 
                filter(type_uai!="Non couvert") %>% 
                group_by(type_formation,libelle_type_diplome,Filiere,type_uai) %>% 
                summarise(nb=n()) %>% 
                mutate(part=prop.table(nb)) %>% 
                pivot_longer(cols = c(nb,part)) %>% 
                mutate(type_uai=case_when(
                  name=="nb"~paste0(type_uai," (nb)"),
                  name=="part"~paste0(type_uai," (%)")
                )) %>% 
                select(-name) %>% 
                pivot_wider(names_from = type_uai,values_from = value) %>% 
                mutate_all(replace_na,0,),
              by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>%
        filter(Couverture=="Non couvert") %>% 
        filter(certificateur_valideur_simpli!="Ministère de l'éducation nationale ou Ministère de l'agriculture") %>% 
        group_by(type_formation,libelle_type_diplome,Filiere) %>% 
        summarise(nb=n()) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Autres ministères certificateurs (nb)"=nb),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        filter(Couverture=="Non couvert") %>% 
        filter(type_territoire!="Territoire normalement couvert") %>% 
        group_by(type_formation,libelle_type_diplome,Filiere) %>% 
        summarise(nb=n()) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Territoires non couverts (nb)"=nb),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        filter(Couverture=="Non couvert") %>% 
        filter(Nouvelle_formation) %>% 
        group_by(type_formation,libelle_type_diplome,Filiere ) %>% 
        summarise(nb=n()) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Nouvelles formations (nb)"=nb),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        filter(Couverture=="Non couvert") %>% 
        filter(is.na(presence_UAI_ACCE))%>% 
        group_by(type_formation,libelle_type_diplome,Filiere ) %>% 
        summarise(nb=n()) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - UAI inconnu (nb)"=nb),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        filter(Couverture=="Non couvert") %>% 
        filter(!Nouvelle_formation) %>%   
        filter(is.na(presence_Code_Scolarité_certif_info))%>% 
        group_by(type_formation,libelle_type_diplome,Filiere ) %>% 
        summarise(nb=n()) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - code certif inconnu (nb)"=nb),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>%
        filter(Couverture=="Non couvert") %>%
        filter(scope) %>% 
        group_by(type_formation,libelle_type_diplome,Filiere ) %>% 
        summarise(nb=n()) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - sans raison évidente (nb)"=nb),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    mutate(
      `Non couvert - Autres ministères certificateurs (%)`=`Non couvert - Autres ministères certificateurs (nb)`/`Non couvert (nb)`,
      `Non couvert - Territoires non couverts (%)`=`Non couvert - Territoires non couverts (nb)`/`Non couvert (nb)`,
      `Non couvert - Nouvelles formations (%)`=`Non couvert - Nouvelles formations (nb)`/`Non couvert (nb)`,
      `Non couvert - UAI inconnu (%)`=`Non couvert - UAI inconnu (nb)`/`Non couvert (nb)`,
      `Non couvert - code certif inconnu (%)`=`Non couvert - code certif inconnu (nb)`/`Non couvert (nb)`,
      `Non couvert - sans raison évidente (%)`=`Non couvert - sans raison évidente (nb)`/`Non couvert (nb)`
    ) 
  
  
  
  
  ##stats_catalogue_partenaire_globale----
  
  stats_catalogue_partenaire_globale <- catalogue_partenaire_renseigne %>%
    select(UAI,MEFSTAT11,famillemetiers,FORMATION_DIPLOME,Filiere,NIVEAU_FORMATION_DIPLOME,LIBELLE_COURT,NIVEAU_QUALIFICATION_RNCP,type_formation,libelle_type_diplome) %>% 
    summarise("Nombre de formations"=n()) %>% 
    mutate("Part du  catalogue"=prop.table(`Nombre de formations`),
           type_formation="Total",libelle_type_diplome="Total",Filiere="Total") %>% 
    left_join(catalogue_partenaire_renseigne %>%
                select(UAI,MEFSTAT11,famillemetiers,FORMATION_DIPLOME,Filiere,NIVEAU_FORMATION_DIPLOME,LIBELLE_COURT,NIVEAU_QUALIFICATION_RNCP,type_formation,libelle_type_diplome) %>% 
                mutate(
                  famillemetiers=ifelse(is.na(famillemetiers),"Hors famille de métiers",famillemetiers)
                ) %>% 
                group_by(famillemetiers) %>% 
                summarise(`Nombre de formations`=n()) %>% 
                ungroup() %>% 
                left_join(
                  catalogue_partenaire_renseigne %>% 
                    filter(Couverture=="Couvert") %>% 
                    group_by(famillemetiers) %>% 
                    summarise("Nombre de formations couvertes"=n()),
                  by=c("famillemetiers")
                ) %>% 
                mutate(
                  `Nombre de formations couvertes`=replace_na(`Nombre de formations couvertes`,0),
                  Couverture=`Nombre de formations couvertes`/`Nombre de formations`
                ) %>% 
                pivot_longer(
                  cols = c(`Nombre de formations`,`Nombre de formations couvertes`,Couverture)
                ) %>% 
                mutate(
                  name=case_when(
                    name == "Nombre de formations" ~ paste0(famillemetiers," (nb)"),
                    name == "Nombre de formations couvertes" ~ paste0(famillemetiers," - Formations couvertes (nb)"),
                    name == "Couverture" ~ paste0(famillemetiers," - Formations couvertes (%)")
                  )
                ) %>% 
                select(-famillemetiers) %>% 
                mutate(
                  name=factor(name,
                              levels=c("Famille de métiers (nb)", 
                                       "Famille de métiers - Formations couvertes (nb)", "Famille de métiers - Formations couvertes (%)",
                                       "Hors famille de métiers (nb)", "Hors famille de métiers - Formations couvertes (nb)",
                                       "Hors famille de métiers - Formations couvertes (%)"
                              ),
                              labels=c("Formations associées à une famille de métiers (nb)", 
                                       "Formations associées à une famille de métiers - Formations couvertes (nb)", 
                                       "Formations associées à une famille de métiers - Formations couvertes (%)",
                                       "Formations non associées à une famille de métiers (nb)", 
                                       "Formations non associées à une famille de métiers - Formations couvertes (nb)",
                                       "Formations non associées à une famille de métiers - Formations couvertes (%)"
                              )
                  )
                ) %>% 
                pivot_wider(names_from = name,values_from = value) %>% 
                mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total"),
              by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>%
    left_join(
      catalogue_partenaire_renseigne %>% 
        group_by(Couverture) %>%
        summarise(nb=n()) %>% 
        mutate(part=prop.table(nb)) %>% 
        pivot_longer(cols = c(nb,part)) %>% 
        mutate(Couverture=case_when(
          name=="nb"~paste0(Couverture," (nb)"),
          name=="part"~paste0(Couverture," (%)")
        )) %>% 
        select(-name) %>% 
        pivot_wider(names_from = Couverture,values_from = value) %>% 
        mutate_all(replace_na,0,) %>% 
        mutate(`Non couvert (nb)`=`Non couvert (nb)`+`Sous le seuil de 20 élèves (nb)`,
               `Non couvert (%)`=`Non couvert (%)`+`Sous le seuil de 20 élèves (%)`,
               type_formation="Total",libelle_type_diplome="Total",Filiere="Total"),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        filter(type_uai!="Non couvert") %>% 
        group_by(type_uai) %>%
        summarise(nb=n())  %>% 
        mutate(part=prop.table(nb)) %>% 
        pivot_longer(cols = c(nb,part)) %>% 
        mutate(type_uai=case_when(
          name=="nb"~paste0(type_uai," (nb)"),
          name=="part"~paste0(type_uai," (%)")
        )) %>% 
        select(-name)  %>% 
        pivot_wider(names_from = type_uai,values_from = value) %>% 
        mutate_all(replace_na,0) %>% 
        mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total"),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>%
        filter(Couverture=="Non couvert") %>% 
        filter(certificateur_valideur_simpli!="Ministère de l'éducation nationale ou Ministère de l'agriculture") %>% 
        summarise(nb=n()) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Autres ministères certificateurs (nb)"=nb) %>% 
        mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total"),
      by=c("type_formation","libelle_type_diplome","Filiere")) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        filter(Couverture=="Non couvert") %>% 
        filter(type_territoire=="Territoire mal couvert") %>% 
        summarise(nb=n()) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Territoires non couverts (nb)"=nb) %>% 
        mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total"),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        filter(Couverture=="Non couvert") %>% 
        filter(Nouvelle_formation) %>% 
        summarise(nb=n()) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Nouvelles formations (nb)"=nb)%>% 
        mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total"),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        filter(Couverture=="Non couvert") %>% 
        filter(is.na(presence_UAI_ACCE))%>% 
        summarise(nb=n()) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - UAI inconnu (nb)"=nb) %>% 
        mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total"),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        filter(Couverture=="Non couvert") %>% 
        filter(!Nouvelle_formation) %>%   
        filter(is.na(presence_Code_Scolarité_certif_info))%>% 
        summarise(nb=n()) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - code certif inconnu (nb)"=nb) %>% 
        mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total"),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>%
        filter(Couverture=="Non couvert") %>%
        filter(scope) %>% 
        summarise(nb=n()) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - sans raison évidente (nb)"=nb)%>% 
        mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total"),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    mutate(
      `Non couvert - Autres ministères certificateurs (%)`=`Non couvert - Autres ministères certificateurs (nb)`/`Non couvert (nb)`,
      `Non couvert - Territoires non couverts (%)`=`Non couvert - Territoires non couverts (nb)`/`Non couvert (nb)`,
      `Non couvert - Nouvelles formations (%)`=`Non couvert - Nouvelles formations (nb)`/`Non couvert (nb)`,
      `Non couvert - UAI inconnu (%)`=`Non couvert - UAI inconnu (nb)`/`Non couvert (nb)`,
      `Non couvert - code certif inconnu (%)`=`Non couvert - code certif inconnu (nb)`/`Non couvert (nb)`,
      `Non couvert - sans raison évidente (%)`=`Non couvert - sans raison évidente (nb)`/`Non couvert (nb)`
      
    ) 
  
  
  
  
  ## Synthese ----
  
  stats_catalogue_partenaire_temp <- stats_catalogue_partenaire %>% 
    bind_rows(stats_catalogue_partenaire_globale) 
  
  
  col_to_add <- setdiff(c("type_formation", "libelle_type_diplome", "Filiere", "Nombre de formations", 
                          "Part du  catalogue", "Couvert (nb)", "Couvert (%)",
                          
                          "Formations associées à une famille de métiers (nb)", 
                          "Formations associées à une famille de métiers - Formations couvertes (nb)", 
                          "Formations associées à une famille de métiers - Formations couvertes (%)",
                          "Formations non associées à une famille de métiers (nb)", 
                          "Formations non associées à une famille de métiers - Formations couvertes (nb)",
                          "Formations non associées à une famille de métiers - Formations couvertes (%)",
                          
                          "Non couvert (nb)", "Non couvert (%)", 
                          "Sous le seuil de 20 élèves (nb)", "Sous le seuil de 20 élèves (%)","UAI Formateur - Couvert + sous le seuil (nb)", 
                          "UAI Formateur - Couvert + sous le seuil (%)", "UAI Gestionnaire - Couvert + sous le seuil (nb)", "UAI Gestionnaire - Couvert + sous le seuil (%)", "UAI Lieu formation - Couvert + sous le seuil (nb)", 
                          "UAI Lieu formation - Couvert + sous le seuil (%)","Non couvert - Autres ministères certificateurs (nb)","Non couvert - Autres ministères certificateurs (%)",
                          "Non couvert - Territoires non couverts (nb)","Non couvert - Territoires non couverts (%)",
                          "Non couvert - Nouvelles formations (nb)","Non couvert - Nouvelles formations (%)",
                          "Non couvert - UAI inconnu (nb)", "Non couvert - UAI inconnu (%)",
                          "Non couvert - code certif inconnu (nb)","Non couvert - code certif inconnu (%)",
                          "Non couvert - sans raison évidente (nb)","Non couvert - sans raison évidente (%)"),
                        names(stats_catalogue_partenaire_temp)
  )
  
  if(length(col_to_add)>0){
    
    stats_catalogue_partenaire_temp <- stats_catalogue_partenaire_temp %>% 
      bind_cols(
        map(setdiff(c("type_formation", "libelle_type_diplome", "Filiere", "Nombre de formations", 
                      "Part du  catalogue", "Couvert (nb)", "Couvert (%)",
                      
                      "Formations associées à une famille de métiers (nb)", 
                      "Formations associées à une famille de métiers - Formations couvertes (nb)", 
                      "Formations associées à une famille de métiers - Formations couvertes (%)",
                      "Formations non associées à une famille de métiers (nb)", 
                      "Formations non associées à une famille de métiers - Formations couvertes (nb)",
                      "Formations non associées à une famille de métiers - Formations couvertes (%)",
                      
                      "Non couvert (nb)", "Non couvert (%)", 
                      "Sous le seuil de 20 élèves (nb)", "Sous le seuil de 20 élèves (%)","UAI Formateur - Couvert + sous le seuil (nb)", 
                      "UAI Formateur - Couvert + sous le seuil (%)", "UAI Gestionnaire - Couvert + sous le seuil (nb)", "UAI Gestionnaire - Couvert + sous le seuil (%)", "UAI Lieu formation - Couvert + sous le seuil (nb)", 
                      "UAI Lieu formation - Couvert + sous le seuil (%)","Non couvert - Autres ministères certificateurs (nb)","Non couvert - Autres ministères certificateurs (%)",
                      "Non couvert - Territoires non couverts (nb)","Non couvert - Territoires non couverts (%)",
                      "Non couvert - Nouvelles formations (nb)","Non couvert - Nouvelles formations (%)",
                      
                      "Non couvert - UAI inconnu (nb)", "Non couvert - UAI inconnu (%)",
                      "Non couvert - code certif inconnu (nb)","Non couvert - code certif inconnu (%)",
                      "Non couvert - sans raison évidente (nb)","Non couvert - sans raison évidente (%)"),
                    names(stats_catalogue_partenaire_temp)
        ),function(x){
          tibble(!!sym(x):=rep(NA,nrow(stats_catalogue_partenaire_temp)))
        }) %>% 
          reduce(bind_cols)    
      )  
  } 
  
  stats_catalogue_partenaire_temp <- stats_catalogue_partenaire_temp %>% 
    select(-contains("(%)")) %>%
    mutate_at(vars(contains("(nb)")),.funs = list(pct=~./`Nombre de formations`)) %>%  
    setNames(str_replace(names(.),pattern = "\\(nb\\)_pct",replacement = "(%)"))
  
  stats_catalogue_partenaire <- stats_catalogue_partenaire_temp %>% 
    select(
      c("type_formation", "libelle_type_diplome", "Filiere", "Nombre de formations", 
        "Part du  catalogue", 
        "Formations non associées à une famille de métiers (nb)", 
        "Formations associées à une famille de métiers (nb)", 
        
        "Couvert (nb)", "Couvert (%)", 
        
        "Formations non associées à une famille de métiers - Formations couvertes (nb)", 
        "Formations non associées à une famille de métiers - Formations couvertes (%)", 
        "Formations associées à une famille de métiers - Formations couvertes (nb)", 
        "Formations associées à une famille de métiers - Formations couvertes (%)", 
        
        "Non couvert (nb)", "Non couvert (%)", 
        
        "Sous le seuil de 20 élèves (nb)", 
        "Sous le seuil de 20 élèves (%)", 
        "Non couvert - Nouvelles formations (nb)", 
        "Non couvert - Nouvelles formations (%)", 
        
        # "UAI Formateur - Couvert + sous le seuil (nb)", 
        # "UAI Formateur - Couvert + sous le seuil (%)", 
        # "UAI Gestionnaire - Couvert + sous le seuil (nb)", 
        # "UAI Gestionnaire - Couvert + sous le seuil (%)", 
        # "UAI Lieu formation - Couvert + sous le seuil (nb)", 
        # "UAI Lieu formation - Couvert + sous le seuil (%)", 
        
        
        
        "Non couvert - code certif inconnu (nb)", 
        "Non couvert - code certif inconnu (%)", 
        "Non couvert - Autres ministères certificateurs (nb)", 
        "Non couvert - Autres ministères certificateurs (%)", 
        "Non couvert - UAI inconnu (nb)", 
        "Non couvert - UAI inconnu (%)", 
        "Non couvert - Territoires non couverts (nb)", 
        "Non couvert - Territoires non couverts (%)",
        "Non couvert - sans raison évidente (nb)","Non couvert - sans raison évidente (%)"
      )
    ) %>% 
    rename(
      "Avant/après bac"=type_formation,
      "Type diplôme"=libelle_type_diplome,
      "Couverture (nb)"=`Couvert (nb)`,
      "Couverture (%)"=`Couvert (%)`,
      "Dont sous le seuil de 20 élèves (nb)"=`Sous le seuil de 20 élèves (nb)`,
      "Dont sous le seuil de 20 élèves (%)"=`Sous le seuil de 20 élèves (%)`,
      "Territoires mal couverts (nb)"="Non couvert - Territoires non couverts (nb)", 
      "Territoires mal couverts (%)"="Non couvert - Territoires non couverts (%)" 
    ) %>% 
    mutate(
      `Avant/après bac`=ifelse(`Avant/après bac`=="Avant le bac","Avant","Après"),
      Filiere=ifelse(Filiere=="Scolaire","Sco.","App.")
    )
  
  
  
  #Stats voeux ----
  
  var_effectifs <- "Demandes tous voeux"

  
  if(type_voeux=="affelnet"){
    if("MEFSTAT11_voeux" %in% names(catalogue_partenaire_renseigne)){
      catalogue_partenaire_renseigne_voeux <-  catalogue_partenaire_renseigne %>% 
        left_join(
          catalogue_partenaire_renseigne %>% 
            unnest() %>% 
            mutate(
              code_certification=case_when(
                Filiere=="Scolaire" ~ MEFSTAT11_voeux,
                Filiere=="Apprentissage" ~ FORMATION_DIPLOME
              )
            ) %>% 
            left_join(
              voeux_parcoursup_affelnet_simpli_2023 %>% 
                filter(!is.na(code_certification)),
              by=c("UAI","code_certification","Filiere")
            ) %>%
            group_by(across(setdiff(names(catalogue_partenaire_renseigne),"data"))) %>% 
            summarise(!!sym(var_effectifs):=sum(!!sym(var_effectifs),na.rm=T)) ,
          by=setdiff(names(catalogue_partenaire_renseigne),"data")
        ) 
    }else{
      catalogue_partenaire_renseigne_voeux <-  catalogue_partenaire_renseigne %>% 
        left_join(
          catalogue_partenaire_renseigne %>% 
            unnest() %>% 
            mutate(
              code_certification=case_when(
                Filiere=="Scolaire" ~ MEFSTAT11,
                Filiere=="Apprentissage" ~ FORMATION_DIPLOME
              )
            ) %>% 
            left_join(
              voeux_parcoursup_affelnet_simpli_2023 %>% 
                filter(!is.na(code_certification)),
              by=c("UAI","code_certification","Filiere")
            ) %>%
            group_by(across(setdiff(names(catalogue_partenaire_renseigne),"data"))) %>% 
            summarise(!!sym(var_effectifs):=sum(!!sym(var_effectifs),na.rm=T)) ,
          by=setdiff(names(catalogue_partenaire_renseigne),"data")
        ) 
    }
  }else if(type_voeux=="parcoursup"){
    catalogue_partenaire_renseigne_voeux <- catalogue_partenaire_renseigne %>% 
      filter(is.na(CODEFORMATIONACCUEIL)) %>% 
      mutate(!!sym(var_effectifs):=as.numeric(NA)) %>% 
      bind_rows(
        catalogue_partenaire_renseigne %>% 
          filter(!is.na(CODEFORMATIONACCUEIL))%>% 
          left_join(
            voeux_parcoursup_affelnet_simpli_2023 %>%
              select(c(CODEFORMATIONACCUEIL,all_of(var_effectifs))),
            by="CODEFORMATIONACCUEIL"
          )
      )
    
  }
    
  

  
  ##stats_catalogue_partenaire ----
  
  stats_catalogue_partenaire_voeux <- catalogue_partenaire_renseigne_voeux %>%
    ungroup() %>% 
    group_by(type_formation,libelle_type_diplome,Filiere) %>% 
    summarise(Effectifs=sum(!!sym(var_effectifs),na.rm=T)) %>% 
    ungroup() %>% 
    mutate("Part du  catalogue"=prop.table(Effectifs)) %>% 
    left_join(
      catalogue_partenaire_renseigne_voeux %>%
        group_by(type_formation,libelle_type_diplome,Filiere,famillemetiers) %>% 
        summarise(Effectifs=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        ungroup() %>% 
        left_join(
          catalogue_partenaire_renseigne_voeux %>% 
            filter(Couverture =="Couvert")%>%   
            group_by(type_formation,libelle_type_diplome,Filiere,famillemetiers) %>% 
            summarise("Effectifs couverts"=sum(!!sym(var_effectifs),na.rm=T)),
          by=c("type_formation","libelle_type_diplome","Filiere","famillemetiers")
        ) %>% 
        mutate(
          famillemetiers=ifelse(is.na(famillemetiers),"Hors famille de métiers",famillemetiers),
          `Effectifs couverts`=replace_na(`Effectifs couverts`,0),
          Couverture=`Effectifs couverts`/`Effectifs`
        ) %>% 
        pivot_longer(
          cols = c(`Effectifs`,`Effectifs couverts`,Couverture)
        ) %>% 
        mutate(
          name=case_when(
            name == "Effectifs" ~ paste0(famillemetiers," (nb)"),
            name == "Effectifs couverts" ~ paste0(famillemetiers," - Effectifs couverts (nb)"),
            name == "Couverture" ~ paste0(famillemetiers," - Effectifs couverts (%)")
          )
        ) %>% 
        select(-famillemetiers) %>% 
        mutate(
          name=factor(name,
                      levels=c("Famille de métiers (nb)", 
                               "Famille de métiers - Effectifs couverts (nb)", "Famille de métiers - Effectifs couverts (%)",
                               "Hors famille de métiers (nb)", "Hors famille de métiers - Effectifs couverts (nb)",
                               "Hors famille de métiers - Effectifs couverts (%)"
                      ),
                      labels=c("Formations associées à une famille de métiers (nb)", 
                               "Formations associées à une famille de métiers - Effectifs couverts (nb)", 
                               "Formations associées à une famille de métiers - Effectifs couverts (%)",
                               "Formations non associées à une famille de métiers (nb)", 
                               "Formations non associées à une famille de métiers - Effectifs couverts (nb)",
                               "Formations non associées à une famille de métiers - Effectifs couverts (%)"
                      )
          )
        ) %>% 
        pivot_wider(names_from = name,values_from = value),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne_voeux %>% 
        group_by(type_formation,libelle_type_diplome,Filiere,Couverture) %>% 
        summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        mutate(part=prop.table(nb)) %>% 
        pivot_longer(cols = c(nb,part)) %>% 
        mutate(Couverture=case_when(
          name=="nb"~paste0(Couverture," (nb)"),
          name=="part"~paste0(Couverture," (%)")
        )) %>% 
        select(-name) %>% 
        pivot_wider(names_from = Couverture,values_from = value) %>% 
        mutate_all(replace_na,0,) %>% 
        mutate(`Non couvert (nb)`=`Non couvert (nb)`+`Sous le seuil de 20 élèves (nb)`,
               `Non couvert (%)`=`Non couvert (%)`+`Sous le seuil de 20 élèves (%)`),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(catalogue_partenaire_renseigne_voeux %>% 
                filter(type_uai!="Non couvert") %>% 
                group_by(type_formation,libelle_type_diplome,Filiere,type_uai) %>% 
                summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
                mutate(part=prop.table(nb)) %>% 
                pivot_longer(cols = c(nb,part)) %>% 
                mutate(type_uai=case_when(
                  name=="nb"~paste0(type_uai," (nb)"),
                  name=="part"~paste0(type_uai," (%)")
                )) %>% 
                select(-name) %>% 
                pivot_wider(names_from = type_uai,values_from = value) %>% 
                mutate_all(replace_na,0,),
              by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne_voeux %>%
        filter(Couverture =="Non couvert")%>%   
        filter(certificateur_valideur_simpli!="Ministère de l'éducation nationale ou Ministère de l'agriculture") %>% 
        group_by(type_formation,libelle_type_diplome,Filiere) %>% 
        summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Autres ministères certificateurs (nb)"=nb),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne_voeux %>% 
        filter(Couverture =="Non couvert")%>%   
        filter(type_territoire=="Territoire mal couvert") %>% 
        group_by(type_formation,libelle_type_diplome,Filiere ) %>% 
        summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Territoires non couverts (nb)"=nb),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne_voeux %>% 
        filter(Couverture =="Non couvert")%>%   
        filter(Nouvelle_formation) %>% 
        group_by(type_formation,libelle_type_diplome,Filiere ) %>% 
        summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Nouvelles formations (nb)"=nb),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne_voeux %>% 
        filter(Couverture =="Non couvert")%>%   
        filter(is.na(presence_UAI_ACCE))%>% 
        group_by(type_formation,libelle_type_diplome,Filiere ) %>% 
        summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - UAI inconnu (nb)"=nb),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne_voeux %>% 
        filter(Couverture =="Non couvert")%>%   
        filter(!Nouvelle_formation) %>%   
        filter(is.na(presence_Code_Scolarité_certif_info))%>% 
        group_by(type_formation,libelle_type_diplome,Filiere ) %>% 
        summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - code certif inconnu (nb)"=nb),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne_voeux %>%
        filter(Couverture=="Non couvert") %>%
        filter(scope) %>% 
        group_by(type_formation,libelle_type_diplome,Filiere ) %>% 
        summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - sans raison évidente (nb)"=nb),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    mutate(
      `Non couvert - Autres ministères certificateurs (%)`=`Non couvert - Autres ministères certificateurs (nb)`/`Non couvert (nb)`,
      `Non couvert - Territoires non couverts (%)`=`Non couvert - Territoires non couverts (nb)`/`Non couvert (nb)`,
      `Non couvert - Nouvelles formations (%)`=`Non couvert - Nouvelles formations (nb)`/`Non couvert (nb)`,
      `Non couvert - UAI inconnu (%)`=`Non couvert - UAI inconnu (nb)`/`Non couvert (nb)`,
      `Non couvert - code certif inconnu (%)`=`Non couvert - code certif inconnu (nb)`/`Non couvert (nb)`,
      `Non couvert - sans raison évidente (%)`=`Non couvert - sans raison évidente (nb)`/`Non couvert (nb)`
    )     
  
  
  
  ##stats_catalogue_partenaire_globale----
  
  stats_catalogue_partenaire_globale_voeux <- catalogue_partenaire_renseigne_voeux %>%
    ungroup() %>% 
    summarise(Effectifs=sum(!!sym(var_effectifs),na.rm=T)) %>% 
    ungroup() %>% 
    mutate("Part du  catalogue"=prop.table(Effectifs)) %>% 
    bind_cols(
      catalogue_partenaire_renseigne_voeux %>%
        group_by(famillemetiers) %>% 
        summarise(Effectifs=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        ungroup() %>% 
        left_join(
          catalogue_partenaire_renseigne_voeux %>% 
            filter(Couverture =="Couvert")%>%   
            group_by(famillemetiers) %>% 
            summarise("Effectifs couverts"=sum(!!sym(var_effectifs),na.rm=T)),
          by=c("famillemetiers")
        ) %>% 
        mutate(
          famillemetiers=ifelse(is.na(famillemetiers),"Hors famille de métiers",famillemetiers)
        ) %>% 
        group_by(famillemetiers) %>% 
        summarise_at(vars(`Effectifs couverts`,Effectifs),sum,na.rm=T) %>% 
        mutate(
          `Effectifs couverts`=replace_na(`Effectifs couverts`,0),
          Couverture=`Effectifs couverts`/`Effectifs`
        ) %>% 
        pivot_longer(
          cols = c(`Effectifs`,`Effectifs couverts`,Couverture)
        ) %>% 
        mutate(
          name=case_when(
            name == "Effectifs" ~ paste0(famillemetiers," (nb)"),
            name == "Effectifs couverts" ~ paste0(famillemetiers," - Effectifs couverts (nb)"),
            name == "Couverture" ~ paste0(famillemetiers," - Effectifs couverts (%)")
          )
        ) %>% 
        select(-famillemetiers) %>% 
        mutate(
          name=factor(name,
                      levels=c("Famille de métiers (nb)", 
                               "Famille de métiers - Effectifs couverts (nb)", "Famille de métiers - Effectifs couverts (%)",
                               "Hors famille de métiers (nb)", "Hors famille de métiers - Effectifs couverts (nb)",
                               "Hors famille de métiers - Effectifs couverts (%)"
                      ),
                      labels=c("Formations associées à une famille de métiers (nb)", 
                               "Formations associées à une famille de métiers - Effectifs couverts (nb)", 
                               "Formations associées à une famille de métiers - Effectifs couverts (%)",
                               "Formations non associées à une famille de métiers (nb)", 
                               "Formations non associées à une famille de métiers - Effectifs couverts (nb)",
                               "Formations non associées à une famille de métiers - Effectifs couverts (%)"
                      )
          )
        ) %>% 
        pivot_wider(names_from = name,values_from = value)
    )  %>% 
    bind_cols(
      catalogue_partenaire_renseigne_voeux %>% 
        group_by(Couverture) %>% 
        summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        mutate(part=prop.table(nb)) %>% 
        pivot_longer(cols = c(nb,part)) %>% 
        mutate(Couverture=case_when(
          name=="nb"~paste0(Couverture," (nb)"),
          name=="part"~paste0(Couverture," (%)")
        )) %>% 
        select(-name) %>% 
        pivot_wider(names_from = Couverture,values_from = value) %>% 
        mutate_all(replace_na,0,) %>% 
        mutate(`Non couvert (nb)`=`Non couvert (nb)`+`Sous le seuil de 20 élèves (nb)`,
               `Non couvert (%)`=`Non couvert (%)`+`Sous le seuil de 20 élèves (%)`)
    ) %>%  
    bind_cols(catalogue_partenaire_renseigne_voeux %>% 
                filter(type_uai!="Non couvert") %>% 
                group_by(type_uai) %>% 
                summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
                mutate(part=prop.table(nb)) %>% 
                pivot_longer(cols = c(nb,part)) %>% 
                mutate(type_uai=case_when(
                  name=="nb"~paste0(type_uai," (nb)"),
                  name=="part"~paste0(type_uai," (%)")
                )) %>% 
                select(-name) %>% 
                pivot_wider(names_from = type_uai,values_from = value) %>% 
                mutate_all(replace_na,0,)
    ) %>% 
    bind_cols(
      catalogue_partenaire_renseigne_voeux %>%
        filter(Couverture =="Non couvert")%>%   
        filter(certificateur_valideur_simpli!="Ministère de l'éducation nationale ou Ministère de l'agriculture") %>% 
        summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Autres ministères certificateurs (nb)"=nb)
    ) %>% 
    bind_cols(
      catalogue_partenaire_renseigne_voeux %>% 
        filter(Couverture =="Non couvert")%>%   
        filter(type_territoire=="Territoire mal couvert") %>% 
        summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Territoires non couverts (nb)"=nb)
    ) %>% 
    bind_cols(
      catalogue_partenaire_renseigne_voeux %>% 
        filter(Couverture =="Non couvert")%>%   
        filter(Nouvelle_formation) %>% 
        summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Nouvelles formations (nb)"=nb)
    ) %>% 
    bind_cols(
      catalogue_partenaire_renseigne_voeux %>% 
        filter(Couverture =="Non couvert")%>%   
        filter(is.na(presence_UAI_ACCE))%>% 
        summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - UAI inconnu (nb)"=nb)
    ) %>% 
    bind_cols(
      catalogue_partenaire_renseigne_voeux %>% 
        filter(Couverture =="Non couvert")%>%   
        filter(!Nouvelle_formation) %>%   
        filter(is.na(presence_Code_Scolarité_certif_info))%>% 
        summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - code certif inconnu (nb)"=nb)
    ) %>% 
    bind_cols(
      catalogue_partenaire_renseigne_voeux %>%
        filter(Couverture=="Non couvert") %>%
        filter(scope) %>% 
        summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - sans raison évidente (nb)"=nb)
    ) %>% 
    mutate(
      `Non couvert - Autres ministères certificateurs (%)`=`Non couvert - Autres ministères certificateurs (nb)`/`Non couvert (nb)`,
      `Non couvert - Territoires non couverts (%)`=`Non couvert - Territoires non couverts (nb)`/`Non couvert (nb)`,
      `Non couvert - Nouvelles formations (%)`=`Non couvert - Nouvelles formations (nb)`/`Non couvert (nb)`,
      `Non couvert - UAI inconnu (%)`=`Non couvert - UAI inconnu (nb)`/`Non couvert (nb)`,
      `Non couvert - code certif inconnu (%)`=`Non couvert - code certif inconnu (nb)`/`Non couvert (nb)`,
      `Non couvert - sans raison évidente (%)`=`Non couvert - sans raison évidente (nb)`/`Non couvert (nb)`
    ) %>% 
    mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total")
  
  
  ## Synthese ----
  
  
  stats_catalogue_partenaire_voeux_temp <- stats_catalogue_partenaire_voeux %>% 
    bind_rows(stats_catalogue_partenaire_globale_voeux) 
  
  col_to_add <- setdiff(c("type_formation", "libelle_type_diplome", "Filiere", "Effectifs", 
                          "Part du  catalogue", "Couvert (nb)", "Couvert (%)", 
                          
                          
                          "Formations associées à une famille de métiers (nb)", 
                          "Formations associées à une famille de métiers - Effectifs couverts (nb)", 
                          "Formations associées à une famille de métiers - Effectifs couverts (%)",
                          "Formations non associées à une famille de métiers (nb)", 
                          "Formations non associées à une famille de métiers - Effectifs couverts (nb)",
                          "Formations non associées à une famille de métiers - Effectifs couverts (%)",
                          
                          
                          "Non couvert (nb)", "Non couvert (%)", 
                          "Sous le seuil de 20 élèves (nb)", "Sous le seuil de 20 élèves (%)","UAI Formateur - Couvert + sous le seuil (nb)", 
                          "UAI Formateur - Couvert + sous le seuil (%)", "UAI Gestionnaire - Couvert + sous le seuil (nb)", "UAI Gestionnaire - Couvert + sous le seuil (%)", "UAI Lieu formation - Couvert + sous le seuil (nb)", 
                          "UAI Lieu formation - Couvert + sous le seuil (%)","Non couvert - Autres ministères certificateurs (nb)","Non couvert - Autres ministères certificateurs (%)",
                          "Non couvert - Territoires non couverts (nb)","Non couvert - Territoires non couverts (%)",
                          "Non couvert - Nouvelles formations (nb)","Non couvert - Nouvelles formations (%)",
                          
                          "Non couvert - UAI inconnu (nb)", "Non couvert - UAI inconnu (%)",
                          "Non couvert - code certif inconnu (nb)","Non couvert - code certif inconnu (%)",
                          "Non couvert - sans raison évidente (nb)","Non couvert - sans raison évidente (%)"),
                        names(stats_catalogue_partenaire_voeux_temp)
  )
  
  if(length(col_to_add)>0){
    
    stats_catalogue_partenaire_voeux_temp <- stats_catalogue_partenaire_voeux_temp %>% 
      bind_cols(
        map(setdiff(c("type_formation", "libelle_type_diplome", "Filiere", "Effectifs", 
                      "Part du  catalogue", "Couvert (nb)", "Couvert (%)", 
                      
                      
                      "Formations associées à une famille de métiers (nb)", 
                      "Formations associées à une famille de métiers - Effectifs couverts (nb)", 
                      "Formations associées à une famille de métiers - Effectifs couverts (%)",
                      "Formations non associées à une famille de métiers (nb)", 
                      "Formations non associées à une famille de métiers - Effectifs couverts (nb)",
                      "Formations non associées à une famille de métiers - Effectifs couverts (%)",
                      
                      
                      "Non couvert (nb)", "Non couvert (%)", 
                      "Sous le seuil de 20 élèves (nb)", "Sous le seuil de 20 élèves (%)","UAI Formateur - Couvert + sous le seuil (nb)", 
                      "UAI Formateur - Couvert + sous le seuil (%)", "UAI Gestionnaire - Couvert + sous le seuil (nb)", "UAI Gestionnaire - Couvert + sous le seuil (%)", "UAI Lieu formation - Couvert + sous le seuil (nb)", 
                      "UAI Lieu formation - Couvert + sous le seuil (%)","Non couvert - Autres ministères certificateurs (nb)","Non couvert - Autres ministères certificateurs (%)",
                      "Non couvert - Territoires non couverts (nb)","Non couvert - Territoires non couverts (%)",
                      "Non couvert - Nouvelles formations (nb)","Non couvert - Nouvelles formations (%)",
                      
                      "Non couvert - UAI inconnu (nb)", "Non couvert - UAI inconnu (%)",
                      "Non couvert - code certif inconnu (nb)","Non couvert - code certif inconnu (%)",
                      "Non couvert - sans raison évidente (nb)","Non couvert - sans raison évidente (%)"),
                    names(stats_catalogue_partenaire_voeux_temp)
        ),function(x){
          tibble(!!sym(x):=rep(NA,nrow(stats_catalogue_partenaire_voeux_temp)))
        }) %>% 
          reduce(bind_cols)    
      )  
  } 
  
  
  stats_catalogue_partenaire_voeux_temp <- stats_catalogue_partenaire_voeux_temp %>% 
    select(-contains("(%)")) %>%
    mutate_at(vars(contains("(nb)")),.funs = list(pct=~./`Effectifs`)) %>%  
    setNames(str_replace(names(.),pattern = "\\(nb\\)_pct",replacement = "(%)"))
  
  stats_catalogue_partenaire_voeux <- stats_catalogue_partenaire_voeux_temp %>% 
    select(
      c("type_formation", "libelle_type_diplome", "Filiere", 
        
        "Effectifs", 
        
        "Part du  catalogue", 
        "Formations non associées à une famille de métiers (nb)",
        "Formations associées à une famille de métiers (nb)",
        
        "Couvert (nb)", "Couvert (%)", 
        
        "Formations non associées à une famille de métiers - Effectifs couverts (nb)",
        "Formations non associées à une famille de métiers - Effectifs couverts (%)",
        "Formations associées à une famille de métiers - Effectifs couverts (nb)",
        "Formations associées à une famille de métiers - Effectifs couverts (%)",
        
        "Non couvert (nb)", "Non couvert (%)", 
        
        "Sous le seuil de 20 élèves (nb)", 
        "Sous le seuil de 20 élèves (%)", 
        "Non couvert - Nouvelles formations (nb)", 
        "Non couvert - Nouvelles formations (%)", 
        
        # "UAI Formateur - Couvert + sous le seuil (nb)", 
        # "UAI Formateur - Couvert + sous le seuil (%)", 
        # "UAI Gestionnaire - Couvert + sous le seuil (nb)", 
        # "UAI Gestionnaire - Couvert + sous le seuil (%)", 
        # "UAI Lieu formation - Couvert + sous le seuil (nb)", 
        # "UAI Lieu formation - Couvert + sous le seuil (%)", 
        
        
        
        "Non couvert - code certif inconnu (nb)", 
        "Non couvert - code certif inconnu (%)", 
        "Non couvert - Autres ministères certificateurs (nb)", 
        "Non couvert - Autres ministères certificateurs (%)", 
        "Non couvert - UAI inconnu (nb)", 
        "Non couvert - UAI inconnu (%)", 
        "Non couvert - Territoires non couverts (nb)", 
        "Non couvert - Territoires non couverts (%)",
        "Non couvert - sans raison évidente (nb)","Non couvert - sans raison évidente (%)"
      )
    ) %>% 
    rename(
      "Avant/après bac"=type_formation,
      "Type diplôme"=libelle_type_diplome,
      "Couverture (nb)"=`Couvert (nb)`,
      "Couverture (%)"=`Couvert (%)`,
      "Dont sous le seuil de 20 élèves (nb)"=`Sous le seuil de 20 élèves (nb)`,
      "Dont sous le seuil de 20 élèves (%)"=`Sous le seuil de 20 élèves (%)`,
      "Territoires mal couverts (nb)"="Non couvert - Territoires non couverts (nb)", 
      "Territoires mal couverts (%)"="Non couvert - Territoires non couverts (%)",
      !!sym(var_effectifs):=Effectifs
    ) %>% 
    mutate(
      `Avant/après bac`=ifelse(`Avant/après bac`=="Avant le bac","Avant","Après"),
      Filiere=ifelse(Filiere=="Scolaire","Sco.","App.")
    )
  
  
  
  
  
  
  return(list(stats_catalogue_partenaire=stats_catalogue_partenaire,
              stats_catalogue_partenaire_voeux=stats_catalogue_partenaire_voeux))
}