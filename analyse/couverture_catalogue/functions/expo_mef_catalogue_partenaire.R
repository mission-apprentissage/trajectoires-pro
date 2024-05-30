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
  stats_catalogue_partenaire <- catalogue_partenaire_renseigne %>%
    distinct(UAI,MEFSTAT11,famillemetiers,FORMATION_DIPLOME,Filiere,NIVEAU_FORMATION_DIPLOME,LIBELLE_COURT,NIVEAU_QUALIFICATION_RNCP,type_formation,libelle_type_diplome) %>% 
    ungroup() %>% 
    group_by(type_formation,libelle_type_diplome,Filiere) %>% 
    summarise("Nombre de formations"=n()) %>% 
    ungroup() %>% 
    mutate("Part du catalogue"=prop.table(`Nombre de formations`)) %>% 
    left_join(
      catalogue_partenaire_renseigne %>%
        distinct(UAI,MEFSTAT11,famillemetiers,FORMATION_DIPLOME,Filiere,NIVEAU_FORMATION_DIPLOME,LIBELLE_COURT,NIVEAU_QUALIFICATION_RNCP,type_formation,libelle_type_diplome) %>% 
        filter(famillemetiers=="Famille de métiers") %>% 
        group_by(type_formation,libelle_type_diplome,Filiere) %>% 
        summarise("Nombre de formations d'une famille de métiers"=n()) %>% 
        ungroup() ,
      by=c("type_formation","libelle_type_diplome","Filiere")) %>% 
    mutate(`Nombre de formations d'une famille de métiers`=replace_na(`Nombre de formations d'une famille de métiers`,0)) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        mutate(Couvert=map_lgl(data,~any(.$Couverture=="Couvert"))) %>% 
        group_by(type_formation,libelle_type_diplome,Filiere,famillemetiers) %>% 
        summarise("Nombre de formations"=n()) %>% 
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
          `Part de formations couvertes`=`Nombre de formations couvertes`/`Nombre de formations`
        ) %>% 
        select(-"Nombre de formations")  %>% 
        pivot_longer(cols=c(`Nombre de formations couvertes`,`Part de formations couvertes`)) %>% 
        mutate(
          name=case_when(
            famillemetiers=="Hors famille de métiers" & name == "Nombre de formations couvertes"~"Nombre de formations hors familles de métiers couvertes",
            famillemetiers=="Hors famille de métiers" & name == "Part de formations couvertes"~"Part de formations hors familles de métiers couvertes",
            famillemetiers=="Famille de métiers" & name == "Nombre de formations couvertes"~"Nombre de formations d'une famille de métiers couvertes",
            famillemetiers=="Famille de métiers" & name == "Part de formations couvertes"~"Part de formations d'une famille de métiers couvertes"
          )
        )  %>% 
        select(-famillemetiers) %>% 
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
        summarise(nb=n()) %>%  
        mutate(part=prop.table(nb)) %>% 
        pivot_longer(cols=c(nb,part)) %>% 
        mutate(
          name=case_when(
            Couverture=="Non couvert" & name == "nb"~"Nombre de formations non couvertes",
            Couverture=="Non couvert" & name == "part"~"Part de formations non couvertes",
            Couverture=="Couvert" & name == "nb"~"Nombre de formations couvertes",
            Couverture=="Couvert" & name == "part"~"Part de formations couvertes",
            Couverture=="Sous le seuil de 20 élèves" & name == "nb"~"Nombre de formations non couvertes sous le seuil de 20 élèves",
            Couverture=="Sous le seuil de 20 élèves" & name == "part"~"Part de formations non couvertes sous le seuil de 20 élèves",
          )
        )  %>% 
        select(-Couverture) %>% 
        pivot_wider(names_from = name,values_from = value) %>% 
        mutate_all(replace_na,0,) %>% 
        mutate(
          `Nombre de formations non couvertes`=`Nombre de formations non couvertes`+`Nombre de formations non couvertes sous le seuil de 20 élèves`,
          `Part de formations non couvertes`=`Part de formations non couvertes`+`Part de formations non couvertes sous le seuil de 20 élèves`
        ) ,
      by=c("type_formation","libelle_type_diplome","Filiere")
    )
  
  
  stats_catalogue_partenaire_globale <- catalogue_partenaire_renseigne %>%
    distinct(UAI,MEFSTAT11,famillemetiers,FORMATION_DIPLOME,Filiere,NIVEAU_FORMATION_DIPLOME,LIBELLE_COURT,NIVEAU_QUALIFICATION_RNCP,type_formation,libelle_type_diplome) %>% 
    summarise("Nombre de formations"=n()) %>% 
    mutate("Part du catalogue"=prop.table(`Nombre de formations`),
           type_formation="Total",libelle_type_diplome="Total",Filiere="Total") %>% 
    left_join(
      catalogue_partenaire_renseigne %>%
        distinct(UAI,MEFSTAT11,famillemetiers,FORMATION_DIPLOME,Filiere,NIVEAU_FORMATION_DIPLOME,LIBELLE_COURT,NIVEAU_QUALIFICATION_RNCP,type_formation,libelle_type_diplome) %>% 
        filter(famillemetiers=="Famille de métiers") %>% 
        summarise("Nombre de formations d'une famille de métiers"=n()) %>% 
        mutate(type_formation="Total",libelle_type_diplome="Total",Filiere="Total") ,
      by=c("type_formation","libelle_type_diplome","Filiere")) %>% 
    mutate(`Nombre de formations d'une famille de métiers`=replace_na(`Nombre de formations d'une famille de métiers`,0)) %>% 
    left_join(
      catalogue_partenaire_renseigne %>% 
        mutate(Couvert=map_lgl(data,~any(.$Couverture=="Couvert"))) %>% 
        group_by(famillemetiers) %>% 
        summarise("Nombre de formations"=n()) %>% 
        left_join(
          catalogue_partenaire_renseigne %>% 
            mutate(Couvert=map_lgl(data,~any(.$Couverture=="Couvert"))) %>% 
            filter(Couvert)%>%   
            group_by(famillemetiers) %>% 
            summarise("Nombre de formations couvertes"=n()),
          by="famillemetiers"
        ) %>% 
        mutate(
          `Nombre de formations couvertes`=replace_na(`Nombre de formations couvertes`,0),
          `Part de formations couvertes`=`Nombre de formations couvertes`/`Nombre de formations`
        )  %>% 
        select(-"Nombre de formations")  %>% 
        pivot_longer(cols=c(`Nombre de formations couvertes`,`Part de formations couvertes`)) %>% 
        mutate(
          name=case_when(
            famillemetiers=="Hors famille de métiers" & name == "Nombre de formations couvertes"~"Nombre de formations hors familles de métiers couvertes",
            famillemetiers=="Hors famille de métiers" & name == "Part de formations couvertes"~"Part de formations hors familles de métiers couvertes",
            famillemetiers=="Famille de métiers" & name == "Nombre de formations couvertes"~"Nombre de formations d'une famille de métiers couvertes",
            famillemetiers=="Famille de métiers" & name == "Part de formations couvertes"~"Part de formations d'une famille de métiers couvertes"
          )
        )  %>% 
        select(-famillemetiers) %>% 
        pivot_wider(names_from = name,values_from = value) %>% 
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
        mutate(part=prop.table(nb)) %>% 
        pivot_longer(cols=c(nb,part)) %>% 
        mutate(
          name=case_when(
            Couverture=="Non couvert" & name == "nb"~"Nombre de formations non couvertes",
            Couverture=="Non couvert" & name == "part"~"Part de formations non couvertes",
            Couverture=="Couvert" & name == "nb"~"Nombre de formations couvertes",
            Couverture=="Couvert" & name == "part"~"Part de formations couvertes",
            Couverture=="Sous le seuil de 20 élèves" & name == "nb"~"Nombre de formations non couvertes sous le seuil de 20 élèves",
            Couverture=="Sous le seuil de 20 élèves" & name == "part"~"Part de formations non couvertes sous le seuil de 20 élèves",
          )
        )  %>% 
        select(-Couverture) %>% 
        pivot_wider(names_from = name,values_from = value) %>% 
        mutate_all(replace_na,0,) %>% 
        mutate(
          `Nombre de formations non couvertes`=`Nombre de formations non couvertes`+`Nombre de formations non couvertes sous le seuil de 20 élèves`,
          `Part de formations non couvertes`=`Part de formations non couvertes`+`Part de formations non couvertes sous le seuil de 20 élèves`,
          type_formation="Total",libelle_type_diplome="Total",Filiere="Total") ,
      by=c("type_formation","libelle_type_diplome","Filiere")
    )
  
  stats_catalogue_partenaire_temp <- stats_catalogue_partenaire %>% 
    bind_rows(stats_catalogue_partenaire_globale) 
  
  col_to_add <- setdiff(c("type_formation", "libelle_type_diplome", "Filiere", "Nombre de formations", 
                          "Part du catalogue", "Nombre de formations d'une famille de métiers", 
                          "Nombre de formations hors familles de métiers couvertes", "Part de formations hors familles de métiers couvertes", 
                          "Nombre de formations d'une famille de métiers couvertes", "Part de formations d'une famille de métiers couvertes", 
                          "Nombre de formations non couvertes", "Part de formations non couvertes", 
                          "Nombre de formations couvertes", "Part de formations couvertes", 
                          "Nombre de formations non couvertes sous le seuil de 20 élèves", 
                          "Part de formations non couvertes sous le seuil de 20 élèves"),
                        names(stats_catalogue_partenaire_temp)
  )
  
  if(length(col_to_add)>0){
    
    stats_catalogue_partenaire_temp <- stats_catalogue_partenaire_temp %>% 
      bind_cols(
        map(setdiff(c("type_formation", "libelle_type_diplome", "Filiere", "Nombre de formations", 
                      "Part du catalogue", "Nombre de formations d'une famille de métiers", 
                      "Nombre de formations hors familles de métiers couvertes", "Part de formations hors familles de métiers couvertes", 
                      "Nombre de formations d'une famille de métiers couvertes", "Part de formations d'une famille de métiers couvertes", 
                      "Nombre de formations non couvertes", "Part de formations non couvertes", 
                      "Nombre de formations couvertes", "Part de formations couvertes", 
                      "Nombre de formations non couvertes sous le seuil de 20 élèves", 
                      "Part de formations non couvertes sous le seuil de 20 élèves"),
                    names(stats_catalogue_partenaire_temp)
        ),function(x){
          tibble(!!sym(x):=rep(NA,nrow(stats_catalogue_partenaire_temp)))
        }) %>% 
          reduce(bind_cols)    
      )  
  } 
  
  
  stats_catalogue_partenaire <- stats_catalogue_partenaire_temp %>% 
    select(c("type_formation", "libelle_type_diplome", "Filiere", "Nombre de formations", 
             "Part du catalogue", "Nombre de formations d'une famille de métiers", 
             "Nombre de formations hors familles de métiers couvertes", "Part de formations hors familles de métiers couvertes", 
             "Nombre de formations d'une famille de métiers couvertes", "Part de formations d'une famille de métiers couvertes", 
             "Nombre de formations non couvertes", "Part de formations non couvertes", 
             "Nombre de formations couvertes", "Part de formations couvertes", 
             "Nombre de formations non couvertes sous le seuil de 20 élèves", 
             "Part de formations non couvertes sous le seuil de 20 élèves")
    ) %>%  
    rename(
      "Avant/après bac"=type_formation,
      "Type diplôme"=libelle_type_diplome
    )
  
  return(stats_catalogue_partenaire)
}
