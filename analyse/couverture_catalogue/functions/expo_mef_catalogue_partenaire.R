expo_mef_catalogue_partenaire <- function(catalogue_init,type_source){
  
  catalogue_partenaire_renseigne <- catalogue_init %>% 
    left_join(
      famillemetiers_2024 %>% 
        select(`MEFSTAT11 2DE PRO Affelnet`,`MEFSTAT11 TERMINALE PRO IJ`,`Famille de métiers`),
      by=c("MEFSTAT11"="MEFSTAT11 2DE PRO Affelnet")
    ) %>% 
    left_join(
      n_mef %>%
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
    distinct(UAI,MEFSTAT11,
             MEFSTAT11_annee_terminale,
             code_certification,
             famillemetiers,
             FORMATION_DIPLOME,Filiere) %>% 
    left_join(
      n_mef %>%
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
    group_by(UAI,MEFSTAT11,Filiere,famillemetiers,FORMATION_DIPLOME,NIVEAU_FORMATION_DIPLOME,NIVEAU_QUALIFICATION_RNCP,LIBELLE_COURT) %>% 
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
              by=c("UAI","MEFSTAT11","Filiere"))
  
  return(catalogue_partenaire_renseigne)
} 

expo_mef_stats_catalogue_partenaire <- function(catalogue_partenaire_renseigne){
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
        filter(famillemetiers=="Famille de métiers") %>% 
        group_by(type_formation,libelle_type_diplome,Filiere) %>% 
        summarise("Famille de métiers"=n()) %>% 
        ungroup() ,
      by=c("type_formation","libelle_type_diplome","Filiere")) %>% 
    mutate(`Famille de métiers`=replace_na(`Famille de métiers`,0)) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        mutate(Couvert=map_lgl(data,~any(.$Couverture=="Couvert"))) %>% 
        group_by(type_formation,libelle_type_diplome,Filiere,famillemetiers) %>% 
        summarise(`Nombre de formations`=n()) %>% 
        ungroup() %>% 
        left_join(
          catalogue_partenaire_renseigne %>% 
            mutate(Couvert=map_lgl(data,~any(.$Couverture=="Couvert"))) %>% 
            filter(Couvert)%>%   
            group_by(type_formation,libelle_type_diplome,Filiere,famillemetiers) %>% 
            summarise("Nombre de formations couvertes"=n()),
          by=c("type_formation","libelle_type_diplome","Filiere","famillemetiers")
        ) %>% 
        mutate(
          `Nombre de formations couvertes`=replace_na(`Nombre de formations couvertes`,0),
          Couverture=`Nombre de formations couvertes`/`Nombre de formations`
        ) %>% 
        select(-contains("Nombre de formations")) %>% 
        mutate(famillemetiers=ifelse(famillemetiers=="Hors famille de métiers","Couverture - Hors familles de métiers","Couverture - Familles de métiers")) %>% 
        pivot_wider(names_from = famillemetiers,values_from = `Couverture`),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
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
        group_by(type_formation,libelle_type_diplome,Filiere,Couverture) %>% 
        summarise(nb=n()) %>% 
        mutate(nb=prop.table(nb)) %>% 
        # filter(Couverture!="Couvert") %>%
        pivot_wider(names_from = Couverture,values_from = nb) %>% 
        mutate_all(replace_na,0,) %>% 
        mutate(`Non couvert`=`Non couvert`+`Sous le seuil de 20 élèves`),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) 
  
  
  ##stats_catalogue_partenaire_globale----
  
  stats_catalogue_partenaire_globale <- catalogue_partenaire_renseigne %>%
    select(UAI,MEFSTAT11,famillemetiers,FORMATION_DIPLOME,Filiere,NIVEAU_FORMATION_DIPLOME,LIBELLE_COURT,NIVEAU_QUALIFICATION_RNCP,type_formation,libelle_type_diplome) %>% 
    summarise("Nombre de formations"=n()) %>% 
    mutate("Part du  catalogue"=prop.table(`Nombre de formations`),
           type_formation="Total",libelle_type_diplome="Total",Filiere="Total") %>% 
    # left_join(
    #   catalogue_partenaire_renseigne %>%
    #     select(UAI,MEFSTAT11,famillemetiers,FORMATION_DIPLOME,Filiere,NIVEAU_FORMATION_DIPLOME,LIBELLE_COURT,NIVEAU_QUALIFICATION_RNCP,type_formation,libelle_type_diplome) %>% 
    #     filter(famillemetiers=="Famille de métiers") %>% 
    #     summarise("Famille de métiers"=n()) %>% 
    #     mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total") ,
    #   by=c("type_formation","libelle_type_diplome","Filiere")) %>% 
    # mutate(`Famille de métiers`=replace_na(`Famille de métiers`,0)) %>% 
    # left_join(
    #   catalogue_partenaire_renseigne %>% 
    #     mutate(Couvert=map_lgl(data,~any(.$Couverture=="Couvert"))) %>% 
    #     group_by(famillemetiers) %>% 
    #     summarise("Nombre de formations"=n()) %>% 
    #     left_join(
    #       catalogue_partenaire_renseigne %>% 
    #         mutate(Couvert=map_lgl(data,~any(.$Couverture=="Couvert"))) %>% 
    #         filter(Couvert)%>%   
    #         group_by(famillemetiers) %>% 
    #         summarise("Nombre de formations couvertes"=n()),
    #       by="famillemetiers"
    #     ) %>% 
    #     mutate(
    #       `Nombre de formations couvertes`=replace_na(`Nombre de formations couvertes`,0),
    #       Couverture=`Nombre de formations couvertes`/`Nombre de formations`
    #     )%>% 
    #     select(-contains("Nombre de formations")) %>% 
    #     mutate(famillemetiers=ifelse(famillemetiers=="Hors famille de métiers","Couverture - Hors familles de métiers","Couverture - Familles de métiers")) %>% 
    #     pivot_wider(names_from = famillemetiers,values_from = `Couverture`) %>% 
    #     mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total") ,
    #   by=c("type_formation","libelle_type_diplome","Filiere")
    # ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>%
        select(UAI,MEFSTAT11,famillemetiers,FORMATION_DIPLOME,Filiere,NIVEAU_FORMATION_DIPLOME,LIBELLE_COURT,NIVEAU_QUALIFICATION_RNCP,type_formation,libelle_type_diplome) %>% 
        filter(famillemetiers=="Famille de métiers") %>% 
        summarise("Famille de métiers"=n()) %>% 
        mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total") ,
      by=c("type_formation","libelle_type_diplome","Filiere")) %>% 
    mutate(`Famille de métiers`=replace_na(`Famille de métiers`,0)) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        mutate(Couvert=map_lgl(data,~any(.$Couverture=="Couvert"))) %>% 
        group_by(famillemetiers) %>% 
        summarise(`Nombre de formations`=n()) %>% 
        ungroup() %>% 
        left_join(
          catalogue_partenaire_renseigne %>% 
            mutate(Couvert=map_lgl(data,~any(.$Couverture=="Couvert"))) %>% 
            filter(Couvert)%>%   
            group_by(famillemetiers) %>% 
            summarise("Nombre de formations couvertes"=n()),
          by=c("famillemetiers")
        ) %>% 
        mutate(
          `Nombre de formations couvertes`=replace_na(`Nombre de formations couvertes`,0),
          Couverture=`Nombre de formations couvertes`/`Nombre de formations`
        )%>% 
        select(-contains("Nombre de formations")) %>% 
        mutate(famillemetiers=ifelse(famillemetiers=="Hors famille de métiers","Couverture - Hors familles de métiers","Couverture - Familles de métiers")) %>% 
        pivot_wider(names_from = famillemetiers,values_from = `Couverture`) %>% 
        mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total") ,
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>%
    left_join(
      catalogue_partenaire_renseigne %>% 
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
        group_by(Couverture) %>%
        summarise(nb=n()) %>% 
        mutate(nb=prop.table(nb)) %>% 
        # filter(Couverture!="Couvert") %>%
        pivot_wider(names_from = Couverture,values_from = nb) %>% 
        mutate_all(replace_na,0)%>% 
        mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total",
               `Non couvert`=`Non couvert`+`Sous le seuil de 20 élèves`) ,
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
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
        mutate(
          Non_couvert=map_lgl(data,~all(is.na(.$Couverture)))
        ) %>%
        filter(Non_couvert) %>% 
        left_join(
          catalogue_partenaire_renseigne %>% 
            mutate(
              Non_couvert=map_lgl(data,~all(is.na(.$Couverture)))
            ) %>%
            filter(Non_couvert) %>% 
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
            distinct(UAI, MEFSTAT11, Filiere, famillemetiers, FORMATION_DIPLOME,NIVEAU_FORMATION_DIPLOME, LIBELLE_COURT, NIVEAU_QUALIFICATION_RNCP, type_formation, libelle_type_diplome,certificateur_annee_terminale,valideur_annee_terminale)  %>% 
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
            group_by(UAI,MEFSTAT11, Filiere) %>% 
            filter(as.numeric(certificateur_valideur_simpli)==min(as.numeric(certificateur_valideur_simpli)))%>% 
            distinct(UAI, MEFSTAT11, Filiere, certificateur_valideur_simpli),
          by=c("UAI", "MEFSTAT11", "Filiere")
        ) %>% 
        filter(certificateur_valideur_simpli!="Ministère de l'éducation nationale ou Ministère de l'agriculture") %>% 
        summarise(nb=n()) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Autres ministères certificateurs (nb)"=nb) %>% 
        mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total"),
      by=c("type_formation","libelle_type_diplome","Filiere")) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        mutate(
          Non_couvert=map_lgl(data,~all(is.na(.$Couverture)))
        ) %>% 
        filter(Non_couvert) %>% 
        left_join(
          ACCE_UAI %>% 
            distinct(numero_uai,academie,academie_libe),
          by=c("UAI"="numero_uai")
        ) %>% 
        group_by(type_formation,libelle_type_diplome,Filiere,academie ) %>% 
        summarise(nb=n()) %>% 
        group_by(type_formation,libelle_type_diplome,Filiere ) %>%
        mutate(part=prop.table(nb)) %>% 
        filter(str_sub(academie,1,1)=="4") %>% 
        ungroup() %>% 
        summarise(nb=sum(nb)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Territoires non couverts (nb)"=nb) %>% 
        mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total"),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        mutate(
          Non_couvert=map_lgl(data,~all(is.na(.$Couverture)))
        ) %>% 
        filter(Non_couvert) %>% 
        left_join(
          n_formation_diplome %>% 
            mutate(Nouvelle_formation=ifelse(is.na(ANCIEN_DIPLOME_1),T,F)) %>% 
            distinct(FORMATION_DIPLOME,Nouvelle_formation),
          by="FORMATION_DIPLOME"
        )  %>%
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
        mutate(
          Non_couvert=map_lgl(data,~all(is.na(.$Couverture)))
        ) %>%
        filter(Non_couvert) %>% 
        left_join(
          ACCE_UAI %>% 
            distinct(numero_uai) %>% 
            mutate(presence_UAI_ACCE=T),
          by=c("UAI"="numero_uai")
        ) %>% 
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
        mutate(
          Non_couvert=map_lgl(data,~all(is.na(.$Couverture)))
        ) %>%
        filter(Non_couvert)  %>% 
        left_join(
          n_formation_diplome %>% 
            mutate(Nouvelle_formation=ifelse(is.na(ANCIEN_DIPLOME_1),T,F)) %>% 
            distinct(FORMATION_DIPLOME,Nouvelle_formation),
          by="FORMATION_DIPLOME"
        )  %>%
        filter(!Nouvelle_formation) %>%   
        left_join(
          opendata_certif_info %>% 
            filter(!is.na(Code_Scolarité)) %>% 
            distinct(Code_Scolarité) %>% 
            mutate(presence_Code_Scolarité_certif_info=T),
          by=c("FORMATION_DIPLOME"="Code_Scolarité")
        ) %>% 
        filter(is.na(presence_Code_Scolarité_certif_info))%>% 
        summarise(nb=n()) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - code certif inconnu (nb)"=nb) %>% 
        mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total"),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    mutate(
      `Non couvert - Autres ministères certificateurs (%)`=`Non couvert - Autres ministères certificateurs (nb)`/`Non couvert (nb)`,
      `Non couvert - Territoires non couverts (%)`=`Non couvert - Territoires non couverts (nb)`/`Non couvert (nb)`,
      `Non couvert - Nouvelles formations (%)`=`Non couvert - Nouvelles formations (nb)`/`Non couvert (nb)`,
      `Non couvert - UAI inconnu (%)`=`Non couvert - UAI inconnu (nb)`/`Non couvert (nb)`,
      `Non couvert - code certif inconnu (%)`=`Non couvert - code certif inconnu (nb)`/`Non couvert (nb)`
    ) 
  
  
  
  
  stats_catalogue_partenaire_temp <- stats_catalogue_partenaire %>% 
    bind_rows(stats_catalogue_partenaire_globale) 
  
  
  col_to_add <- setdiff(c("type_formation", "libelle_type_diplome", "Filiere", "Nombre de formations", 
                          "Part du  catalogue", "Famille de métiers", "Couvert", "Couverture - Hors familles de métiers", 
                          "Couverture - Familles de métiers", "Non couvert", "Sous le seuil de 20 élèves"),
                        names(stats_catalogue_partenaire_temp)
  )
  
  if(length(col_to_add)>0){
    
    stats_catalogue_partenaire_temp <- stats_catalogue_partenaire_temp %>% 
    bind_cols(
      map(setdiff(c("type_formation", "libelle_type_diplome", "Filiere", "Nombre de formations", 
                    "Part du  catalogue", "Famille de métiers", "Couvert", "Couverture - Hors familles de métiers", 
                    "Couverture - Familles de métiers", "Non couvert", "Sous le seuil de 20 élèves"),
                  names(stats_catalogue_partenaire_temp)
      ),function(x){
        tibble(!!sym(x):=rep(NA,nrow(stats_catalogue_partenaire_temp)))
      }) %>% 
        reduce(bind_cols)    
    )  
  } 
  
  stats_catalogue_partenaire <- stats_catalogue_partenaire_temp %>% 
    select(c("type_formation", "libelle_type_diplome", "Filiere", "Nombre de formations", 
             "Part du  catalogue", "Famille de métiers", "Couvert", "Couverture - Hors familles de métiers", 
             "Couverture - Familles de métiers", "Non couvert", "Sous le seuil de 20 élèves")
    ) %>%  
    rename(
      "Avant/après bac"=type_formation,
      "Type diplôme"=libelle_type_diplome,
      "Couverture - Ensemble"=Couvert,
      "Dont sous le seuil de 20 élèves"=`Sous le seuil de 20 élèves`
    )
  
  
  
  
  #Stats effectifs ----
  ##stats_catalogue_partenaire_effectifs ----
  
  
  
  stats_catalogue_partenaire_effectifs <- catalogue_partenaire_renseigne %>% 
    select(UAI,MEFSTAT11,FORMATION_DIPLOME,type_formation,libelle_type_diplome,Filiere) %>% 
    mutate(code_certification=ifelse(Filiere=="Scolaire",MEFSTAT11,FORMATION_DIPLOME )) %>% 
    left_join(
      effectifs_rentree_simpli,
      by=c("UAI","code_certification","Filiere")
    ) %>% 
    select(-code_certification) %>% 
    group_by(type_formation,libelle_type_diplome,Filiere) %>% 
    summarise("Nombre d'élèves à la rentrée"=sum(effectif_rentree,na.rm = T)) %>% 
    ungroup() %>% 
    left_join(
      catalogue_partenaire_renseigne %>%
        mutate(nb_annee_term =map_dbl(data,function(df){
          if(length(df$nb_annee_term)>1){
            sum(df$nb_annee_term,na.rm = T)
          }else{
            df$nb_annee_term 
          }   
        })
        ) %>% 
        select(UAI,MEFSTAT11,famillemetiers,FORMATION_DIPLOME,Filiere,NIVEAU_FORMATION_DIPLOME,LIBELLE_COURT,NIVEAU_QUALIFICATION_RNCP,type_formation,libelle_type_diplome,nb_annee_term) %>% 
        ungroup() %>% 
        group_by(type_formation,libelle_type_diplome,Filiere) %>% 
        summarise("Nombre d'élèves en année terminale"=sum(nb_annee_term,na.rm = T)) %>% 
        ungroup() %>% 
        mutate("Part du  catalogue"=prop.table(`Nombre d'élèves en année terminale`)),
      by=c("type_formation","libelle_type_diplome","Filiere")) %>% 
    # left_join(
    #   catalogue_partenaire_renseigne %>%
    #     mutate(nb_annee_term =map_dbl(data,function(df){
    #       if(length(df$nb_annee_term)>1){
    #         sum(df$nb_annee_term,na.rm = T)
    #       }else{
    #         df$nb_annee_term 
    #       }   
    #     })) %>% 
    #     select(UAI,MEFSTAT11,famillemetiers,FORMATION_DIPLOME,Filiere,NIVEAU_FORMATION_DIPLOME,LIBELLE_COURT,NIVEAU_QUALIFICATION_RNCP,type_formation,libelle_type_diplome,nb_annee_term) %>% 
    #     filter(famillemetiers=="Famille de métiers") %>% 
    #     group_by(type_formation,libelle_type_diplome,Filiere) %>% 
    #     summarise("Famille de métiers"=sum(nb_annee_term,na.rm = T)) %>% 
    #     ungroup() ,
    #   by=c("type_formation","libelle_type_diplome","Filiere")) %>% 
    # mutate(`Famille de métiers`=replace_na(`Famille de métiers`,0)) %>% 
    # left_join(
    #   catalogue_partenaire_renseigne %>% 
    #     mutate(
    #       Couvert=map_lgl(data,~any(.$Couverture=="Couvert")),
    #       nb_annee_term =map_dbl(data,function(df){
    #         if(length(df$nb_annee_term)>1){
    #           sum(df$nb_annee_term,na.rm = T)
    #         }else{
    #           df$nb_annee_term 
    #         }   
    #       })) %>% 
    #     group_by(type_formation,libelle_type_diplome,Filiere,famillemetiers) %>% 
    #     summarise("Nombre d'élèves en année terminale"=sum(nb_annee_term,na.rm = T)) %>% 
    #     ungroup() %>% 
    #     left_join(
    #       catalogue_partenaire_renseigne %>% 
    #         mutate(
    #           Couvert=map_lgl(data,~any(.$Couverture=="Couvert")),
    #           nb_annee_term =map_dbl(data,function(df){
    #             if(length(df$nb_annee_term)>1){
    #               sum(df$nb_annee_term,na.rm = T)
    #             }else{
    #               df$nb_annee_term 
    #             }   
    #           })) %>% 
    #         filter(Couvert)%>%   
    #         group_by(type_formation,libelle_type_diplome,Filiere,famillemetiers) %>% 
    #         summarise("Nombre d'élèves en année terminale couverts"=sum(nb_annee_term,na.rm = T)),
    #       by=c("type_formation","libelle_type_diplome","Filiere","famillemetiers")
    #     ) %>% 
    #     mutate(
    #       `Nombre d'élèves en année terminale couverts`=replace_na(`Nombre d'élèves en année terminale couverts`,0),
    #       Couverture=`Nombre d'élèves en année terminale couverts`/`Nombre d'élèves en année terminale`
    #     ) %>% 
    #     select(-contains("Nombre d'élèves en année terminale")) %>% 
    #     mutate(famillemetiers=ifelse(famillemetiers=="Hors famille de métiers","Couverture - Hors familles de métiers","Couverture - Familles de métiers")) %>% 
    #     pivot_wider(names_from = famillemetiers,values_from = `Couverture`),
    #   by=c("type_formation","libelle_type_diplome","Filiere")
    # ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>%
        mutate(nb_annee_term =map_dbl(data,function(df){
          if(length(df$nb_annee_term)>1){
            sum(df$nb_annee_term,na.rm = T)
          }else{
            df$nb_annee_term 
          }   
        })
        ) %>% 
        select(UAI,MEFSTAT11,famillemetiers,FORMATION_DIPLOME,Filiere,NIVEAU_FORMATION_DIPLOME,LIBELLE_COURT,NIVEAU_QUALIFICATION_RNCP,type_formation,libelle_type_diplome,nb_annee_term) %>% 
        ungroup() %>% 
        group_by(type_formation,libelle_type_diplome,Filiere,famillemetiers) %>% 
        summarise("Nombre de formations"=sum(nb_annee_term,na.rm = T)) %>% 
        ungroup() %>% 
        left_join(
          catalogue_partenaire_renseigne %>% 
            mutate(
              Couvert=map_lgl(data,~any(.$Couverture=="Couvert")),
              nb_annee_term =map_dbl(data,function(df){
                if(length(df$nb_annee_term)>1){
                  sum(df$nb_annee_term,na.rm = T)
                }else{
                  df$nb_annee_term 
                }   
              })
            ) %>% 
            filter(Couvert)%>%   
            group_by(type_formation,libelle_type_diplome,Filiere,famillemetiers) %>% 
            summarise("Nombre de formations couvertes"=sum(nb_annee_term,na.rm = T)),
          by=c("type_formation","libelle_type_diplome","Filiere","famillemetiers")
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
            name == "Nombre de formations couvertes" ~ paste0(famillemetiers," - Effectifs couverts (nb)"),
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
        pivot_wider(names_from = name,values_from = value) ,
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        mutate(Couvert=map_lgl(data,~any(.$Couverture=="Couvert")),
               Sous_seuil=map_lgl(data,~any(.$Couverture=="Sous le seuil de 20 élèves")),
               Non_couvert=map_lgl(data,~all(is.na(.$Couverture))),
               nb_annee_term =map_dbl(data,function(df){
                 if(length(df$nb_annee_term)>1){
                   sum(df$nb_annee_term,na.rm = T)
                 }else{
                   df$nb_annee_term 
                 }   
               })
        ) %>% 
        mutate(
          Couverture=case_when(
            Couvert~"Couvert",
            Sous_seuil~"Sous le seuil de 20 élèves",
            TRUE~"Non couvert"
          )
        ) %>% 
        group_by(type_formation,libelle_type_diplome,Filiere,Couverture) %>% 
        summarise(nb=sum(nb_annee_term,na.rm = T)) %>% 
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
    left_join(
      catalogue_partenaire_renseigne %>% 
        mutate(
          type_uai_lieu_formation=map_lgl(data,~any(.$uai_donnee_type=="lieu_formation")),
          type_uai_formateur=map_lgl(data,~any(.$uai_donnee_type=="formateur")),
          type_uai_gestionnaire=map_lgl(data,~any(.$uai_donnee_type=="gestionnaire")),
          type_uai_inconnu=map_lgl(data,~any(.$uai_donnee_type=="inconnu")),
          nb_annee_term =map_dbl(data,function(df){
            if(length(df$nb_annee_term)>1){
              sum(df$nb_annee_term,na.rm = T)
            }else{
              df$nb_annee_term 
            }   
          })
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
        filter(type_uai!="Non couvert") %>% 
        group_by(type_formation,libelle_type_diplome,Filiere,type_uai) %>% 
        summarise(nb=sum(nb_annee_term,na.rm = T)) %>% 
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
        mutate(
          Non_couvert=map_lgl(data,~all(is.na(.$Couverture))),
          nb_annee_term =map_dbl(data,function(df){
            if(length(df$nb_annee_term)>1){
              sum(df$nb_annee_term,na.rm = T)
            }else{
              df$nb_annee_term 
            }   
          })
        ) %>%
        filter(Non_couvert) %>% 
        left_join(
          catalogue_partenaire_renseigne %>% 
            mutate(
              Non_couvert=map_lgl(data,~all(is.na(.$Couverture)))
            ) %>%
            filter(Non_couvert) %>% 
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
            distinct(UAI, MEFSTAT11, Filiere, famillemetiers, FORMATION_DIPLOME,NIVEAU_FORMATION_DIPLOME, LIBELLE_COURT, NIVEAU_QUALIFICATION_RNCP, type_formation, libelle_type_diplome,certificateur_annee_terminale,valideur_annee_terminale)  %>% 
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
            group_by(UAI,MEFSTAT11, Filiere) %>% 
            filter(as.numeric(certificateur_valideur_simpli)==min(as.numeric(certificateur_valideur_simpli)))%>% 
            distinct(UAI, MEFSTAT11, Filiere, certificateur_valideur_simpli),
          by=c("UAI", "MEFSTAT11", "Filiere")
        ) %>% 
        filter(certificateur_valideur_simpli!="Ministère de l'éducation nationale ou Ministère de l'agriculture") %>% 
        group_by(type_formation,libelle_type_diplome,Filiere) %>% 
        summarise(nb=sum(nb_annee_term,na.rm = T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Autres ministères certificateurs (nb)"=nb),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        mutate(
          Non_couvert=map_lgl(data,~all(is.na(.$Couverture))),
          nb_annee_term =map_dbl(data,function(df){
            if(length(df$nb_annee_term)>1){
              sum(df$nb_annee_term,na.rm = T)
            }else{
              df$nb_annee_term 
            }   
          })
        ) %>% 
        filter(Non_couvert) %>% 
        left_join(
          ACCE_UAI %>% 
            distinct(numero_uai,academie,academie_libe),
          by=c("UAI"="numero_uai")
        ) %>% 
        filter(str_sub(academie,1,1)=="4") %>% 
        group_by(type_formation,libelle_type_diplome,Filiere ) %>% 
        summarise(nb=sum(nb_annee_term,na.rm = T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Territoires non couverts (nb)"=nb),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        mutate(
          Non_couvert=map_lgl(data,~all(is.na(.$Couverture))),
          nb_annee_term =map_dbl(data,function(df){
            if(length(df$nb_annee_term)>1){
              sum(df$nb_annee_term,na.rm = T)
            }else{
              df$nb_annee_term 
            }   
          })
        ) %>% 
        filter(Non_couvert) %>% 
        left_join(
          n_formation_diplome %>% 
            mutate(Nouvelle_formation=ifelse(is.na(ANCIEN_DIPLOME_1),T,F)) %>% 
            distinct(FORMATION_DIPLOME,Nouvelle_formation),
          by="FORMATION_DIPLOME"
        )  %>%
        filter(Nouvelle_formation) %>% 
        group_by(type_formation,libelle_type_diplome,Filiere ) %>% 
        summarise(nb=sum(nb_annee_term,na.rm = T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Nouvelles formations (nb)"=nb),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>%
    left_join(
      catalogue_partenaire_renseigne %>% 
        mutate(
          Non_couvert=map_lgl(data,~all(is.na(.$Couverture))),
          nb_annee_term =map_dbl(data,function(df){
            if(length(df$nb_annee_term)>1){
              sum(df$nb_annee_term,na.rm = T)
            }else{
              df$nb_annee_term 
            }   
          })
        ) %>%
        filter(Non_couvert) %>% 
        left_join(
          ACCE_UAI %>% 
            distinct(numero_uai) %>% 
            mutate(presence_UAI_ACCE=T),
          by=c("UAI"="numero_uai")
        ) %>% 
        filter(is.na(presence_UAI_ACCE))%>% 
        group_by(type_formation,libelle_type_diplome,Filiere ) %>% 
        summarise(nb=sum(nb_annee_term,na.rm = T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - UAI inconnu (nb)"=nb),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        mutate(
          Non_couvert=map_lgl(data,~all(is.na(.$Couverture))),
          nb_annee_term =map_dbl(data,function(df){
            if(length(df$nb_annee_term)>1){
              sum(df$nb_annee_term,na.rm = T)
            }else{
              df$nb_annee_term 
            }   
          })
        ) %>%
        filter(Non_couvert)  %>% 
        left_join(
          n_formation_diplome %>% 
            mutate(Nouvelle_formation=ifelse(is.na(ANCIEN_DIPLOME_1),T,F)) %>% 
            distinct(FORMATION_DIPLOME,Nouvelle_formation),
          by="FORMATION_DIPLOME"
        )  %>%
        filter(!Nouvelle_formation) %>%   
        left_join(
          opendata_certif_info %>% 
            filter(!is.na(Code_Scolarité)) %>% 
            distinct(Code_Scolarité) %>% 
            mutate(presence_Code_Scolarité_certif_info=T),
          by=c("FORMATION_DIPLOME"="Code_Scolarité")
        ) %>% 
        filter(is.na(presence_Code_Scolarité_certif_info))%>% 
        group_by(type_formation,libelle_type_diplome,Filiere ) %>% 
        summarise(nb=sum(nb_annee_term,na.rm = T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - code certif inconnu (nb)"=nb),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    mutate(
      `Non couvert - Autres ministères certificateurs (%)`=`Non couvert - Autres ministères certificateurs (nb)`/`Non couvert (nb)`,
      `Non couvert - Territoires non couverts (%)`=`Non couvert - Territoires non couverts (nb)`/`Non couvert (nb)`,
      `Non couvert - Nouvelles formations (%)`=`Non couvert - Nouvelles formations (nb)`/`Non couvert (nb)`,
      `Non couvert - UAI inconnu (%)`=`Non couvert - UAI inconnu (nb)`/`Non couvert (nb)`,
      `Non couvert - code certif inconnu (%)`=`Non couvert - code certif inconnu (nb)`/`Non couvert (nb)`
    ) 
  
  
  
  
  ##stats_catalogue_partenaire_globale_effectifs----
  
  
  
  stats_catalogue_partenaire_globale_effectifs <- catalogue_partenaire_renseigne %>% 
    select(UAI,MEFSTAT11,FORMATION_DIPLOME,type_formation,libelle_type_diplome,Filiere) %>% 
    mutate(code_certification=ifelse(Filiere=="Scolaire",MEFSTAT11,FORMATION_DIPLOME )) %>% 
    left_join(
      effectifs_rentree_simpli,
      by=c("UAI","code_certification","Filiere")
    ) %>% 
    select(-code_certification) %>% 
    summarise("Nombre d'élèves à la rentrée"=sum(effectif_rentree,na.rm = T)) %>% 
    ungroup() %>% 
    mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total") %>% 
    left_join(
      catalogue_partenaire_renseigne %>%
        mutate(nb_annee_term =map_dbl(data,function(df){
          if(length(df$nb_annee_term)>1){
            sum(df$nb_annee_term,na.rm = T)
          }else{
            df$nb_annee_term 
          }   
        })
        ) %>% 
        select(UAI,MEFSTAT11,famillemetiers,FORMATION_DIPLOME,Filiere,NIVEAU_FORMATION_DIPLOME,LIBELLE_COURT,NIVEAU_QUALIFICATION_RNCP,type_formation,libelle_type_diplome,nb_annee_term) %>% 
        summarise("Nombre d'élèves en année terminale"=sum(nb_annee_term,na.rm = T)) %>% 
        mutate("Part du  catalogue"=prop.table(`Nombre d'élèves en année terminale`),
               type_formation="Total",libelle_type_diplome="Total",Filiere="Total"),
      by=c("type_formation","libelle_type_diplome","Filiere")) %>%
    # left_join(
    #   catalogue_partenaire_renseigne %>%
    #     mutate(nb_annee_term =map_dbl(data,function(df){
    #       if(length(df$nb_annee_term)>1){
    #         sum(df$nb_annee_term,na.rm = T)
    #       }else{
    #         df$nb_annee_term 
    #       }   
    #     })) %>% 
    #     filter(famillemetiers=="Famille de métiers") %>% 
    #     summarise("Famille de métiers"=n()) %>% 
    #     mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total") ,
    #   by=c("type_formation","libelle_type_diplome","Filiere")) %>% 
    # mutate(`Famille de métiers`=replace_na(`Famille de métiers`,0)) %>% 
    # left_join(
    #   catalogue_partenaire_renseigne %>% 
    #     mutate(Couvert=map_lgl(data,~any(.$Couverture=="Couvert")),
    #            nb_annee_term =map_dbl(data,function(df){
    #              if(length(df$nb_annee_term)>1){
    #                sum(df$nb_annee_term,na.rm = T)
    #              }else{
    #                df$nb_annee_term 
    #              }   
    #            })) %>% 
    #     group_by(famillemetiers) %>% 
    #     summarise("Nombre d'élèves en année terminale"=sum(nb_annee_term,na.rm = T))%>% 
    #     left_join(
    #       catalogue_partenaire_renseigne %>% 
    #         mutate(Couvert=map_lgl(data,~any(.$Couverture=="Couvert")),
    #                nb_annee_term =map_dbl(data,function(df){
    #                  if(length(df$nb_annee_term)>1){
    #                    sum(df$nb_annee_term,na.rm = T)
    #                  }else{
    #                    df$nb_annee_term 
    #                  }   
    #                })) %>% 
    #         filter(Couvert)%>%   
    #         group_by(famillemetiers) %>% 
    #         summarise("Nombre d'élèves en année terminale couverts"=sum(nb_annee_term,na.rm = T)),
    #       by="famillemetiers"
    #     ) %>% 
    #     mutate(
    #       `Nombre d'élèves en année terminale couverts`=replace_na(`Nombre d'élèves en année terminale couverts`,0),
    #       Couverture=`Nombre d'élèves en année terminale couverts`/`Nombre d'élèves en année terminale`
    #     )%>% 
    #     select(-contains("Nombre d'élèves en année terminale")) %>% 
    #     mutate(famillemetiers=ifelse(famillemetiers=="Hors famille de métiers","Couverture - Hors familles de métiers","Couverture - Familles de métiers")) %>% 
    #     pivot_wider(names_from = famillemetiers,values_from = `Couverture`) %>% 
    #     mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total") ,
    #   by=c("type_formation","libelle_type_diplome","Filiere")
    # ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>%
        mutate(nb_annee_term =map_dbl(data,function(df){
          if(length(df$nb_annee_term)>1){
            sum(df$nb_annee_term,na.rm = T)
          }else{
            df$nb_annee_term 
          }   
        })
        ) %>% 
        select(UAI,MEFSTAT11,famillemetiers,FORMATION_DIPLOME,Filiere,NIVEAU_FORMATION_DIPLOME,LIBELLE_COURT,NIVEAU_QUALIFICATION_RNCP,type_formation,libelle_type_diplome,nb_annee_term) %>% 
        ungroup() %>% 
        group_by(famillemetiers) %>% 
        summarise("Nombre de formations"=sum(nb_annee_term,na.rm = T)) %>% 
        ungroup() %>% 
        left_join(
          catalogue_partenaire_renseigne %>% 
            mutate(
              Couvert=map_lgl(data,~any(.$Couverture=="Couvert")),
              nb_annee_term =map_dbl(data,function(df){
                if(length(df$nb_annee_term)>1){
                  sum(df$nb_annee_term,na.rm = T)
                }else{
                  df$nb_annee_term 
                }   
              })
            ) %>% 
            filter(Couvert)%>%   
            group_by(famillemetiers) %>% 
            summarise("Nombre de formations couvertes"=sum(nb_annee_term,na.rm = T)),
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
            name == "Nombre de formations couvertes" ~ paste0(famillemetiers," - Effectifs couverts (nb)"),
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
        pivot_wider(names_from = name,values_from = value) %>% 
        mutate(
          type_formation="Total",libelle_type_diplome="Total",Filiere="Total"
        ),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        mutate(Couvert=map_lgl(data,~any(.$Couverture=="Couvert")),
               Sous_seuil=map_lgl(data,~any(.$Couverture=="Sous le seuil de 20 élèves")),
               Non_couvert=map_lgl(data,~all(is.na(.$Couverture))),
               nb_annee_term =map_dbl(data,function(df){
                 if(length(df$nb_annee_term)>1){
                   sum(df$nb_annee_term,na.rm = T)
                 }else{
                   df$nb_annee_term 
                 }   
               })
        ) %>% 
        mutate(
          Couverture=case_when(
            Couvert~"Couvert",
            Sous_seuil~"Sous le seuil de 20 élèves",
            TRUE~"Non couvert"
          )
        ) %>% 
        group_by(Couverture) %>%
        summarise(nb=sum(nb_annee_term,na.rm = T))  %>% 
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
        mutate(
          type_uai_lieu_formation=map_lgl(data,~any(.$uai_donnee_type=="lieu_formation")),
          type_uai_formateur=map_lgl(data,~any(.$uai_donnee_type=="formateur")),
          type_uai_gestionnaire=map_lgl(data,~any(.$uai_donnee_type=="gestionnaire")),
          type_uai_inconnu=map_lgl(data,~any(.$uai_donnee_type=="inconnu")),
          nb_annee_term =map_dbl(data,function(df){
            if(length(df$nb_annee_term)>1){
              sum(df$nb_annee_term,na.rm = T)
            }else{
              df$nb_annee_term 
            }   
          })
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
        filter(type_uai!="Non couvert") %>% 
        group_by(type_uai) %>%
        summarise(nb=sum(nb_annee_term,na.rm = T)) %>% 
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
        mutate(
          Non_couvert=map_lgl(data,~all(is.na(.$Couverture))),
          nb_annee_term =map_dbl(data,function(df){
            if(length(df$nb_annee_term)>1){
              sum(df$nb_annee_term,na.rm = T)
            }else{
              df$nb_annee_term 
            }   
          })
        ) %>%
        filter(Non_couvert) %>% 
        left_join(
          catalogue_partenaire_renseigne %>% 
            mutate(
              Non_couvert=map_lgl(data,~all(is.na(.$Couverture)))
            ) %>%
            filter(Non_couvert) %>% 
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
            distinct(UAI, MEFSTAT11, Filiere, famillemetiers, FORMATION_DIPLOME,NIVEAU_FORMATION_DIPLOME, LIBELLE_COURT, NIVEAU_QUALIFICATION_RNCP, type_formation, libelle_type_diplome,certificateur_annee_terminale,valideur_annee_terminale)  %>% 
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
            group_by(UAI,MEFSTAT11, Filiere) %>% 
            filter(as.numeric(certificateur_valideur_simpli)==min(as.numeric(certificateur_valideur_simpli)))%>% 
            distinct(UAI, MEFSTAT11, Filiere, certificateur_valideur_simpli),
          by=c("UAI", "MEFSTAT11", "Filiere")
        ) %>% 
        filter(certificateur_valideur_simpli!="Ministère de l'éducation nationale ou Ministère de l'agriculture") %>% 
        summarise(nb=sum(nb_annee_term,na.rm = T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Autres ministères certificateurs (nb)"=nb) %>% 
        mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total") ,
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        mutate(
          Non_couvert=map_lgl(data,~all(is.na(.$Couverture))),
          nb_annee_term =map_dbl(data,function(df){
            if(length(df$nb_annee_term)>1){
              sum(df$nb_annee_term,na.rm = T)
            }else{
              df$nb_annee_term 
            }   
          })
        ) %>% 
        filter(Non_couvert) %>% 
        left_join(
          ACCE_UAI %>% 
            distinct(numero_uai,academie,academie_libe),
          by=c("UAI"="numero_uai")
        ) %>% 
        filter(str_sub(academie,1,1)=="4") %>% 
        summarise(nb=sum(nb_annee_term,na.rm = T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Territoires non couverts (nb)"=nb) %>% 
        mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total"),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        mutate(
          Non_couvert=map_lgl(data,~all(is.na(.$Couverture))),
          nb_annee_term =map_dbl(data,function(df){
            if(length(df$nb_annee_term)>1){
              sum(df$nb_annee_term,na.rm = T)
            }else{
              df$nb_annee_term 
            }   
          })
        ) %>% 
        filter(Non_couvert) %>% 
        left_join(
          n_formation_diplome %>% 
            mutate(Nouvelle_formation=ifelse(is.na(ANCIEN_DIPLOME_1),T,F)) %>% 
            distinct(FORMATION_DIPLOME,Nouvelle_formation),
          by="FORMATION_DIPLOME"
        )  %>%
        filter(Nouvelle_formation) %>% 
        summarise(nb=sum(nb_annee_term,na.rm = T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Nouvelles formations (nb)"=nb) %>% 
        mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total"),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        mutate(
          Non_couvert=map_lgl(data,~all(is.na(.$Couverture))),
          nb_annee_term =map_dbl(data,function(df){
            if(length(df$nb_annee_term)>1){
              sum(df$nb_annee_term,na.rm = T)
            }else{
              df$nb_annee_term 
            }   
          })
        ) %>%
        filter(Non_couvert) %>% 
        left_join(
          ACCE_UAI %>% 
            distinct(numero_uai) %>% 
            mutate(presence_UAI_ACCE=T),
          by=c("UAI"="numero_uai")
        ) %>% 
        filter(is.na(presence_UAI_ACCE))%>% 
        summarise(nb=sum(nb_annee_term,na.rm = T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - UAI inconnu (nb)"=nb) %>% 
        mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total"),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        mutate(
          Non_couvert=map_lgl(data,~all(is.na(.$Couverture))),
          nb_annee_term =map_dbl(data,function(df){
            if(length(df$nb_annee_term)>1){
              sum(df$nb_annee_term,na.rm = T)
            }else{
              df$nb_annee_term 
            }   
          })
        ) %>%
        filter(Non_couvert)  %>% 
        left_join(
          n_formation_diplome %>% 
            mutate(Nouvelle_formation=ifelse(is.na(ANCIEN_DIPLOME_1),T,F)) %>% 
            distinct(FORMATION_DIPLOME,Nouvelle_formation),
          by="FORMATION_DIPLOME"
        )  %>%
        filter(!Nouvelle_formation) %>%   
        left_join(
          opendata_certif_info %>% 
            filter(!is.na(Code_Scolarité)) %>% 
            distinct(Code_Scolarité) %>% 
            mutate(presence_Code_Scolarité_certif_info=T),
          by=c("FORMATION_DIPLOME"="Code_Scolarité")
        ) %>% 
        filter(is.na(presence_Code_Scolarité_certif_info))%>% 
        summarise(nb=sum(nb_annee_term,na.rm = T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - code certif inconnu (nb)"=nb) %>% 
        mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total"),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    mutate(
      `Non couvert - Autres ministères certificateurs (%)`=`Non couvert - Autres ministères certificateurs (nb)`/`Non couvert (nb)`,
      `Non couvert - Territoires non couverts (%)`=`Non couvert - Territoires non couverts (nb)`/`Non couvert (nb)`,
      `Non couvert - Nouvelles formations (%)`=`Non couvert - Nouvelles formations (nb)`/`Non couvert (nb)`,
      `Non couvert - UAI inconnu (%)`=`Non couvert - UAI inconnu (nb)`/`Non couvert (nb)`,
      `Non couvert - code certif inconnu (%)`=`Non couvert - code certif inconnu (nb)`/`Non couvert (nb)`
    )     
  
  
  
  
  ##Synthese----
  
  stats_catalogue_partenaire_effectifs_temp <- stats_catalogue_partenaire_effectifs %>% 
    bind_rows(stats_catalogue_partenaire_globale_effectifs) 
  
  col_to_add_effectifs <- setdiff(c("type_formation", "libelle_type_diplome", "Filiere", "Nombre d'élèves à la rentrée","Nombre d'élèves en année terminale", 
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
                                    "Non couvert - code certif inconnu (nb)","Non couvert - code certif inconnu (%)"),
                                  names(stats_catalogue_partenaire_effectifs_temp)
  )
  
  if(length(col_to_add_effectifs)>0){
    
    stats_catalogue_partenaire_effectifs_temp <- stats_catalogue_partenaire_effectifs_temp %>% 
      bind_cols(
        map(setdiff(c("type_formation", "libelle_type_diplome", "Filiere", "Nombre d'élèves à la rentrée","Nombre d'élèves en année terminale", 
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
                      "Non couvert - code certif inconnu (nb)","Non couvert - code certif inconnu (%)"),
                    names(stats_catalogue_partenaire_effectifs_temp)
        ),function(x){
          tibble(!!sym(x):=rep(NA,nrow(stats_catalogue_partenaire_effectifs_temp)))
        }) %>% 
          reduce(bind_cols)    
      )  
  } 
  
  stats_catalogue_partenaire_effectifs_temp <- stats_catalogue_partenaire_effectifs_temp %>% 
    select(-contains("(%)")) %>%
    mutate_at(vars(contains("(nb)")),.funs = list(pct=~./`Nombre d'élèves en année terminale`)) %>%  
    setNames(str_replace(names(.),pattern = "\\(nb\\)_pct",replacement = "(%)"))
  
  stats_catalogue_partenaire_effectifs_temp <- stats_catalogue_partenaire_effectifs_temp %>% 
    rename(
      "Avant/après bac"=type_formation,
      "Type diplôme"=libelle_type_diplome,
      "Couverture - Ensemble (nb)"=`Couvert (nb)`,
      "Couverture - Ensemble (%)"=`Couvert (%)`,
      "Dont sous le seuil de 20 élèves (nb)"=`Sous le seuil de 20 élèves (nb)`,
      "Dont sous le seuil de 20 élèves (%)"=`Sous le seuil de 20 élèves (%)`
    ) %>% 
    select(
      c("Avant/après bac", "Type diplôme", "Filiere", 
        "Nombre d'élèves à la rentrée",
        "Nombre d'élèves en année terminale", 
        
        "Part du  catalogue", "Couverture - Ensemble (nb)","Couverture - Ensemble (%)", 
        "Non couvert (nb)", "Non couvert (%)",  
        
        "Dont sous le seuil de 20 élèves (nb)", 
        "Dont sous le seuil de 20 élèves (%)", 
        
        "Non couvert - Nouvelles formations (nb)", 
        "Non couvert - Nouvelles formations (%)",
        
        "UAI Formateur - Couvert + sous le seuil (nb)", 
        "UAI Formateur - Couvert + sous le seuil (%)", 
        "UAI Gestionnaire - Couvert + sous le seuil (nb)", 
        "UAI Gestionnaire - Couvert + sous le seuil (%)", 
        "UAI Lieu formation - Couvert + sous le seuil (nb)", 
        "UAI Lieu formation - Couvert + sous le seuil (%)",
        
        "Formations non associées à une famille de métiers (nb)",
        "Formations non associées à une famille de métiers - Effectifs couverts (nb)",
        "Formations non associées à une famille de métiers - Effectifs couverts (%)",
        "Formations associées à une famille de métiers (nb)",
        "Formations associées à une famille de métiers - Effectifs couverts (nb)",
        "Formations associées à une famille de métiers - Effectifs couverts (%)",
        
        "Non couvert - code certif inconnu (nb)",
        "Non couvert - code certif inconnu (%)",
        "Non couvert - Autres ministères certificateurs (nb)", 
        "Non couvert - Autres ministères certificateurs (%)", 
        
        "Non couvert - UAI inconnu (nb)", 
        "Non couvert - UAI inconnu (%)",
        "Non couvert - Territoires non couverts (nb)", 
        "Non couvert - Territoires non couverts (%)")
    )
  
  
  #Stats voeux ----
  ##stats_catalogue_partenaire ----
  
  var_effectifs <- "Demandes tous voeux"
  
  catalogue_partenaire_renseigne <- catalogue_partenaire_renseigne %>% 
    mutate(code_certification=ifelse(Filiere=="Scolaire",MEFSTAT11,FORMATION_DIPLOME )) %>% 
    left_join(
      voeux_parcoursup_affelnet_simpli_2023,
      by=c("UAI","code_certification","Filiere")
    ) %>% 
    select(-code_certification)
  
  # catalogue_partenaire_renseigne %>% 
  #   filter(Filiere=="Apprentissage") %>% 
  #   select(UAI,MEFSTAT11,FORMATION_DIPLOME,`Nombre de voeux affectes`,`Demandes tous voeux`)
  
  stats_catalogue_partenaire_voeux <- catalogue_partenaire_renseigne %>%
    ungroup() %>% 
    group_by(type_formation,libelle_type_diplome,Filiere) %>% 
    summarise(Effectifs=sum(!!sym(var_effectifs),na.rm=T)) %>% 
    ungroup() %>% 
    mutate("Part du  catalogue"=prop.table(Effectifs)) %>% 
    left_join(
      catalogue_partenaire_renseigne %>%
        group_by(type_formation,libelle_type_diplome,Filiere,famillemetiers) %>% 
        summarise(Effectifs=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        ungroup() %>% 
        left_join(
          catalogue_partenaire_renseigne %>% 
            mutate(Couvert=map_lgl(data,~any(.$Couverture=="Couvert"))) %>% 
            filter(Couvert)%>%   
            group_by(type_formation,libelle_type_diplome,Filiere,famillemetiers) %>% 
            summarise("Effectifs couverts"=sum(!!sym(var_effectifs),na.rm=T)),
          by=c("type_formation","libelle_type_diplome","Filiere","famillemetiers")
        ) %>% 
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
        pivot_wider(names_from = name,values_from = value),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
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
    left_join(catalogue_partenaire_renseigne %>% 
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
      catalogue_partenaire_renseigne %>%
        mutate(
          Non_couvert=map_lgl(data,~all(is.na(.$Couverture)))
        ) %>%
        filter(Non_couvert) %>% 
        left_join(
          catalogue_partenaire_renseigne %>% 
            mutate(
              Non_couvert=map_lgl(data,~all(is.na(.$Couverture)))
            ) %>%
            filter(Non_couvert) %>% 
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
            distinct(UAI, MEFSTAT11, Filiere, famillemetiers, FORMATION_DIPLOME,NIVEAU_FORMATION_DIPLOME, LIBELLE_COURT, NIVEAU_QUALIFICATION_RNCP, type_formation, libelle_type_diplome,certificateur_annee_terminale,valideur_annee_terminale)  %>% 
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
            group_by(UAI,MEFSTAT11, Filiere) %>% 
            filter(as.numeric(certificateur_valideur_simpli)==min(as.numeric(certificateur_valideur_simpli)))%>% 
            distinct(UAI, MEFSTAT11, Filiere, certificateur_valideur_simpli),
          by=c("UAI", "MEFSTAT11", "Filiere")
        ) %>% 
        filter(certificateur_valideur_simpli!="Ministère de l'éducation nationale ou Ministère de l'agriculture") %>% 
        group_by(type_formation,libelle_type_diplome,Filiere) %>% 
        summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Autres ministères certificateurs (nb)"=nb),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        mutate(
          Non_couvert=map_lgl(data,~all(is.na(.$Couverture)))
        ) %>% 
        filter(Non_couvert) %>% 
        left_join(
          ACCE_UAI %>% 
            distinct(numero_uai,academie,academie_libe),
          by=c("UAI"="numero_uai")
        ) %>% 
        filter(str_sub(academie,1,1)=="4") %>% 
        group_by(type_formation,libelle_type_diplome,Filiere ) %>% 
        summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Territoires non couverts (nb)"=nb),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        mutate(
          Non_couvert=map_lgl(data,~all(is.na(.$Couverture)))
        ) %>% 
        filter(Non_couvert) %>% 
        left_join(
          n_formation_diplome %>% 
            mutate(Nouvelle_formation=ifelse(is.na(ANCIEN_DIPLOME_1),T,F)) %>% 
            distinct(FORMATION_DIPLOME,Nouvelle_formation),
          by="FORMATION_DIPLOME"
        )  %>%
        filter(Nouvelle_formation) %>% 
        group_by(type_formation,libelle_type_diplome,Filiere ) %>% 
        summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Nouvelles formations (nb)"=nb),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        mutate(
          Non_couvert=map_lgl(data,~all(is.na(.$Couverture))),
        ) %>%
        filter(Non_couvert) %>% 
        left_join(
          ACCE_UAI %>% 
            distinct(numero_uai) %>% 
            mutate(presence_UAI_ACCE=T),
          by=c("UAI"="numero_uai")
        ) %>% 
        filter(is.na(presence_UAI_ACCE))%>% 
        group_by(type_formation,libelle_type_diplome,Filiere ) %>% 
        summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - UAI inconnu (nb)"=nb),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        mutate(
          Non_couvert=map_lgl(data,~all(is.na(.$Couverture)))
        ) %>%
        filter(Non_couvert)  %>% 
        left_join(
          n_formation_diplome %>% 
            mutate(Nouvelle_formation=ifelse(is.na(ANCIEN_DIPLOME_1),T,F)) %>% 
            distinct(FORMATION_DIPLOME,Nouvelle_formation),
          by="FORMATION_DIPLOME"
        )  %>%
        filter(!Nouvelle_formation) %>%   
        left_join(
          opendata_certif_info %>% 
            filter(!is.na(Code_Scolarité)) %>% 
            distinct(Code_Scolarité) %>% 
            mutate(presence_Code_Scolarité_certif_info=T),
          by=c("FORMATION_DIPLOME"="Code_Scolarité")
        ) %>% 
        filter(is.na(presence_Code_Scolarité_certif_info))%>% 
        group_by(type_formation,libelle_type_diplome,Filiere ) %>% 
        summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - code certif inconnu (nb)"=nb),
      by=c("type_formation","libelle_type_diplome","Filiere")
    ) %>% 
    mutate(
      `Non couvert - Autres ministères certificateurs (%)`=`Non couvert - Autres ministères certificateurs (nb)`/`Non couvert (nb)`,
      `Non couvert - Territoires non couverts (%)`=`Non couvert - Territoires non couverts (nb)`/`Non couvert (nb)`,
      `Non couvert - Nouvelles formations (%)`=`Non couvert - Nouvelles formations (nb)`/`Non couvert (nb)`,
      `Non couvert - UAI inconnu (%)`=`Non couvert - UAI inconnu (nb)`/`Non couvert (nb)`,
      `Non couvert - code certif inconnu (%)`=`Non couvert - code certif inconnu (nb)`/`Non couvert (nb)`
    )     
  
  
  
  ##stats_catalogue_partenaire_globale----
  
  stats_catalogue_partenaire_globale_voeux <- catalogue_partenaire_renseigne %>%
    ungroup() %>% 
    summarise(Effectifs=sum(!!sym(var_effectifs),na.rm=T)) %>% 
    ungroup() %>% 
    mutate("Part du  catalogue"=prop.table(Effectifs)) %>% 
    bind_cols(
      catalogue_partenaire_renseigne %>%
        group_by(famillemetiers) %>% 
        summarise(Effectifs=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        ungroup() %>% 
        left_join(
          catalogue_partenaire_renseigne %>% 
            mutate(Couvert=map_lgl(data,~any(.$Couverture=="Couvert"))) %>% 
            filter(Couvert)%>%   
            group_by(famillemetiers) %>% 
            summarise("Effectifs couverts"=sum(!!sym(var_effectifs),na.rm=T)),
          by=c("famillemetiers")
        ) %>% 
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
      catalogue_partenaire_renseigne %>% 
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
    bind_cols(catalogue_partenaire_renseigne %>% 
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
      catalogue_partenaire_renseigne %>%
        mutate(
          Non_couvert=map_lgl(data,~all(is.na(.$Couverture)))
        ) %>%
        filter(Non_couvert) %>% 
        left_join(
          catalogue_partenaire_renseigne %>% 
            mutate(
              Non_couvert=map_lgl(data,~all(is.na(.$Couverture)))
            ) %>%
            filter(Non_couvert) %>% 
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
            distinct(UAI, MEFSTAT11, Filiere, famillemetiers, FORMATION_DIPLOME,NIVEAU_FORMATION_DIPLOME, LIBELLE_COURT, NIVEAU_QUALIFICATION_RNCP, type_formation, libelle_type_diplome,certificateur_annee_terminale,valideur_annee_terminale)  %>% 
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
            group_by(UAI,MEFSTAT11, Filiere) %>% 
            filter(as.numeric(certificateur_valideur_simpli)==min(as.numeric(certificateur_valideur_simpli)))%>% 
            distinct(UAI, MEFSTAT11, Filiere, certificateur_valideur_simpli),
          by=c("UAI", "MEFSTAT11", "Filiere")
        ) %>% 
        filter(certificateur_valideur_simpli!="Ministère de l'éducation nationale ou Ministère de l'agriculture") %>% 
        summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Autres ministères certificateurs (nb)"=nb)
    ) %>% 
    bind_cols(
      catalogue_partenaire_renseigne %>% 
        mutate(
          Non_couvert=map_lgl(data,~all(is.na(.$Couverture)))
        ) %>% 
        filter(Non_couvert) %>% 
        left_join(
          ACCE_UAI %>% 
            distinct(numero_uai,academie,academie_libe),
          by=c("UAI"="numero_uai")
        ) %>% 
        filter(str_sub(academie,1,1)=="4") %>% 
        summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Territoires non couverts (nb)"=nb)
    ) %>% 
    bind_cols(
      catalogue_partenaire_renseigne %>% 
        mutate(
          Non_couvert=map_lgl(data,~all(is.na(.$Couverture)))
        ) %>% 
        filter(Non_couvert) %>% 
        left_join(
          n_formation_diplome %>% 
            mutate(Nouvelle_formation=ifelse(is.na(ANCIEN_DIPLOME_1),T,F)) %>% 
            distinct(FORMATION_DIPLOME,Nouvelle_formation),
          by="FORMATION_DIPLOME"
        )  %>%
        filter(Nouvelle_formation) %>% 
        summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - Nouvelles formations (nb)"=nb)
    ) %>% 
    bind_cols(
      catalogue_partenaire_renseigne %>% 
        mutate(
          Non_couvert=map_lgl(data,~all(is.na(.$Couverture))),
        ) %>%
        filter(Non_couvert) %>% 
        left_join(
          ACCE_UAI %>% 
            distinct(numero_uai) %>% 
            mutate(presence_UAI_ACCE=T),
          by=c("UAI"="numero_uai")
        ) %>% 
        filter(is.na(presence_UAI_ACCE))%>% 
        summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - UAI inconnu (nb)"=nb)
    ) %>% 
    bind_cols(
      catalogue_partenaire_renseigne %>% 
        mutate(
          Non_couvert=map_lgl(data,~all(is.na(.$Couverture)))
        ) %>%
        filter(Non_couvert)  %>% 
        left_join(
          n_formation_diplome %>% 
            mutate(Nouvelle_formation=ifelse(is.na(ANCIEN_DIPLOME_1),T,F)) %>% 
            distinct(FORMATION_DIPLOME,Nouvelle_formation),
          by="FORMATION_DIPLOME"
        )  %>%
        filter(!Nouvelle_formation) %>%   
        left_join(
          opendata_certif_info %>% 
            filter(!is.na(Code_Scolarité)) %>% 
            distinct(Code_Scolarité) %>% 
            mutate(presence_Code_Scolarité_certif_info=T),
          by=c("FORMATION_DIPLOME"="Code_Scolarité")
        ) %>% 
        filter(is.na(presence_Code_Scolarité_certif_info))%>% 
        summarise(nb=sum(!!sym(var_effectifs),na.rm=T)) %>% 
        mutate_all(replace_na,0,) %>% 
        rename(
          "Non couvert - code certif inconnu (nb)"=nb)
    ) %>% 
    mutate(
      `Non couvert - Autres ministères certificateurs (%)`=`Non couvert - Autres ministères certificateurs (nb)`/`Non couvert (nb)`,
      `Non couvert - Territoires non couverts (%)`=`Non couvert - Territoires non couverts (nb)`/`Non couvert (nb)`,
      `Non couvert - Nouvelles formations (%)`=`Non couvert - Nouvelles formations (nb)`/`Non couvert (nb)`,
      `Non couvert - UAI inconnu (%)`=`Non couvert - UAI inconnu (nb)`/`Non couvert (nb)`,
      `Non couvert - code certif inconnu (%)`=`Non couvert - code certif inconnu (nb)`/`Non couvert (nb)`
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
                          "Non couvert - code certif inconnu (nb)","Non couvert - code certif inconnu (%)"),
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
                      "Non couvert - code certif inconnu (nb)","Non couvert - code certif inconnu (%)"),
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
      c("type_formation", "libelle_type_diplome", "Filiere", "Effectifs", 
        
        "Part du  catalogue", "Couvert (nb)", "Couvert (%)",
        "Non couvert (nb)", "Non couvert (%)",  
        
        "Sous le seuil de 20 élèves (nb)", "Sous le seuil de 20 élèves (%)", 
        
        "Non couvert - Nouvelles formations (nb)", 
        "Non couvert - Nouvelles formations (%)",
        
        "UAI Formateur - Couvert + sous le seuil (nb)", 
        "UAI Formateur - Couvert + sous le seuil (%)", 
        "UAI Gestionnaire - Couvert + sous le seuil (nb)", 
        "UAI Gestionnaire - Couvert + sous le seuil (%)", 
        "UAI Lieu formation - Couvert + sous le seuil (nb)", 
        "UAI Lieu formation - Couvert + sous le seuil (%)",
        
        "Formations non associées à une famille de métiers (nb)",
        "Formations non associées à une famille de métiers - Effectifs couverts (nb)",
        "Formations non associées à une famille de métiers - Effectifs couverts (%)",
        "Formations associées à une famille de métiers (nb)",
        "Formations associées à une famille de métiers - Effectifs couverts (nb)",
        "Formations associées à une famille de métiers - Effectifs couverts (%)",
        
        "Non couvert - code certif inconnu (nb)",
        "Non couvert - code certif inconnu (%)",
        "Non couvert - Autres ministères certificateurs (nb)", 
        "Non couvert - Autres ministères certificateurs (%)", 
        
        "Non couvert - UAI inconnu (nb)", 
        "Non couvert - UAI inconnu (%)",
        "Non couvert - Territoires non couverts (nb)", 
        "Non couvert - Territoires non couverts (%)")
    ) %>% 
    rename(
      "Avant/après bac"=type_formation,
      "Type diplôme"=libelle_type_diplome,
      "Couverture - Ensemble (nb)"=`Couvert (nb)`,
      "Couverture - Ensemble (%)"=`Couvert (%)`,
      "Dont sous le seuil de 20 élèves (nb)"=`Sous le seuil de 20 élèves (nb)`,
      "Dont sous le seuil de 20 élèves (%)"=`Sous le seuil de 20 élèves (%)`,
      !!sym(var_effectifs):=Effectifs
    ) 
  
  
  return(list(stats_catalogue_partenaire=stats_catalogue_partenaire,stats_catalogue_partenaire_effectifs_temp=stats_catalogue_partenaire_effectifs_temp,stats_catalogue_partenaire_voeux=stats_catalogue_partenaire_voeux))
}