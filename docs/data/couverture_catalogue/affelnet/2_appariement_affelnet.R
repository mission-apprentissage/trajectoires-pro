# affelnet sla 2025----

n_mef_custom_IJ_familles_metiers_pour_affelnet <- read_excel("../../../../../7- Famille de métiers/n_mef_custom_IJ_familles_metiers_pour_affelnet.xlsx")

Catalogue_affelnet_SLA <- read_excel(file.path(chemin_racine_data,"affelnet/2025/Catalogue SLA 2025 - TrajectoiresPro.xlsx"))

Catalogue_affelnet_SLA_simpli <- Catalogue_affelnet_SLA %>%
  mutate(CODEFORMATIONACCUEIL=1:n()) %>% 
  filter(FL_VISIBLE_PORTAIL=="O") %>% 
  left_join(n_mef %>% 
              select(MEF_STAT_11,FORMATION_DIPLOME) %>% 
              rename(CFD=FORMATION_DIPLOME),
            by=c("CO_MEFSTAT"="MEF_STAT_11")) %>% 
  mutate(code_certification=case_when(
    CO_STA=="ST"~paste0("MEFSTAT11:",CO_MEFSTAT),
    CO_STA=="AP"~paste0("CFD:",CFD)
  )) %>% 
  rename(uai=ID_ETAB) %>% 
  distinct(CODEFORMATIONACCUEIL,uai,code_certification,CFD)



  

## Appariement avec les données InserJeunes ----

affelnet_prepa_insertion_couvert <- Catalogue_affelnet_SLA_simpli %>% 
  inner_join(
    ensemble_data_formationsStats %>%
      select(uai,code_certification,nb_annee_term,taux_en_emploi_6_mois,taux_en_formation,taux_autres_6_mois,Couverture) %>%
      distinct(),
    by=c("uai","code_certification"))  %>%  
  group_by(CODEFORMATIONACCUEIL) %>%
  mutate(
    Couverture=case_when(
      code_certification  %in% (n_mef_custom_IJ_familles_metiers_pour_affelnet %>% 
        mutate(code_certification=paste0("MEFSTAT11:",MEF_STAT_11)) %>% 
        distinct(code_certification) %>% 
        pull(code_certification)) & n() > 1 ~ Couverture,
      n() > 1 ~"Non couvert - Plusieurs codes certification associés",
      Couverture =="Sous le seuil de 20 élèves" ~ "Non couvert - Sous le seuil de 20 élèves",
      Couverture =="Non couvert" ~ "Non couvert - Sans raison évidente",
      T~Couverture
    ),
    Couverture=case_when(
      Couverture=="Sous le seuil de 20 élèves"~"Non couvert - Sous le seuil de 20 élèves",
      Couverture=="Non couvert"~"Non couvert - Sans raison évidente",
      T~Couverture
    )
  ) %>% 
  ungroup()  %>%
  mutate(Couverture=factor(Couverture,levels=c("Couvert","Non couvert - Sous le seuil de 20 élèves","Non couvert - Sans raison évidente"))) %>% 
  left_join(
    n_mef_custom_IJ_familles_metiers_pour_affelnet %>% 
      mutate(code_certification=paste0("MEFSTAT11:",MEF_STAT_11)) %>% 
      distinct(code_certification,FAMILLE_METIER),
    by="code_certification"
  ) %>% 
  group_by(CODEFORMATIONACCUEIL) %>% 
  filter(as.numeric(Couverture)==min(as.numeric(Couverture))) %>% 
  distinct(CODEFORMATIONACCUEIL,uai,code_certification,Couverture)




### Identification des nouvelles certifications ----

certifications_normalement_disponibles <- n_mef %>% 
  select(MEF_STAT_11,FORMATION_DIPLOME,DUREE_DISPOSITIF) %>% 
  drop_na() %>% 
  left_join(
    n_formation_diplome %>% 
      select(FORMATION_DIPLOME,contains("ANCIEN_DIPLOME_")) %>%
      mutate_all(as.character) %>% 
      pivot_longer(cols=contains("ANCIEN_DIPLOME_"),values_to = "ANCIEN_CFD") %>% 
      select(-name)  %>% 
      bind_rows(
        n_formation_diplome %>% 
          select(FORMATION_DIPLOME) %>% 
          mutate(ANCIEN_CFD=FORMATION_DIPLOME)
      ) %>% 
      drop_na() %>% 
      left_join(
        n_formation_diplome %>% 
          select(FORMATION_DIPLOME,DATE_OUVERTURE),
        by=c("ANCIEN_CFD"="FORMATION_DIPLOME")
      ) %>% 
      drop_na() %>% 
      mutate(                
        DATE_OUVERTURE=as.Date(DATE_OUVERTURE,c("%d/%m/%Y"))
      ) %>% 
      group_by(FORMATION_DIPLOME) %>% 
      filter(DATE_OUVERTURE==min(DATE_OUVERTURE)) %>% 
      ungroup() %>% 
      select(FORMATION_DIPLOME,DATE_OUVERTURE) ,
    by="FORMATION_DIPLOME"
  ) %>% 
  mutate(
    ANNEE_PREMIERE_SORIE_SESSION=year(DATE_OUVERTURE)+DUREE_DISPOSITIF+1) %>% 
  group_by(MEF_STAT_11) %>%
  filter(ANNEE_PREMIERE_SORIE_SESSION==min(ANNEE_PREMIERE_SORIE_SESSION)) %>% 
  ungroup() %>% 
  filter(ANNEE_PREMIERE_SORIE_SESSION<=(millesime_ij %>% 
                                          filter(filiere %in% c("pro","apprentissage")) %>% 
                                          pull(millesime) %>% 
                                          unique() %>% 
                                          as.numeric())) %>% 
  distinct(FORMATION_DIPLOME) %>% 
  pull(FORMATION_DIPLOME)


affelnet_prepa_insertion_non_couvert <- Catalogue_affelnet_SLA_simpli %>% 
  anti_join(
    affelnet_prepa_insertion_couvert,
    by=c("CODEFORMATIONACCUEIL")
    ) %>% 
  mutate(
    Couverture="Non couvert"
  ) %>% 
  left_join(
    ACCE_UAI %>% 
      distinct(numero_uai,academie),
    by=c("uai"="numero_uai")
  ) %>% 
  mutate(
    Couverture=case_when(
      !CFD %in% c(certifications_normalement_disponibles,NA) ~ "Non couvert - Nouvelle formation",
      str_sub(academie,1,1)=="4" ~ "Non couvert - Territoire mal couvert",  
      !uai %in% ACCE_UAI$numero_uai ~"Non couvert - UAI Inconnu",
      ! CFD %in% n_formation_diplome$FORMATION_DIPLOME ~"Non couvert - code certification inconnu",
      CFD %in% n_formation_diplome$FORMATION_DIPLOME ~ "Non couvert - Sans raison évidente"
    )
  ) 



affelnet_insertion  <- affelnet_prepa_insertion_couvert %>% 
  # mutate_at(vars(nb_annee_term,taux_en_emploi_6_mois,taux_en_formation,taux_autres_6_mois),~ifelse(Couverture!="Couvert",NA,.)) %>% 
  distinct(CODEFORMATIONACCUEIL,uai,code_certification,Couverture) %>% 
  bind_rows(
    affelnet_prepa_insertion_non_couvert %>% 
      distinct(CODEFORMATIONACCUEIL,uai,code_certification,Couverture)
  ) %>% 
  select(CODEFORMATIONACCUEIL,uai,code_certification,Couverture) %>%  
  rename(
    code_certification_insertion=code_certification,
    Couverture_insertion=Couverture
  )  


affelnet_insertion %>% 
  group_by(Couverture_insertion) %>% 
  summarise(nb=n()) %>% 
  bind_rows(summarise(.,nb=sum(nb)) %>% 
              mutate(Couverture_insertion="Total"))

stats_catalogue_affelnet_couverture <- Catalogue_affelnet_SLA_simpli %>% 
  left_join(
    n_formation_diplome %>% 
      select(FORMATION_DIPLOME,NIVEAU_FORMATION_DIPLOME,LIBELLE_COURT),
    by=c("CFD"="FORMATION_DIPLOME")
  ) %>% 
  mutate(
    `Type diplôme`=case_when(
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
    # type_formation=="Niveau inconnu"~"Inconnu",
    T~LIBELLE_COURT
  ),
  Filiere=ifelse(str_detect(code_certification,"MEFSTAT11:"),"Sco.","App.")
  ) %>% 
  left_join(
    affelnet_insertion %>% 
      select(CODEFORMATIONACCUEIL,Couverture_insertion),
    by="CODEFORMATIONACCUEIL"
  ) %>% 
  mutate(`Type diplôme`=ifelse(is.na(`Type diplôme`),"Inconnu",`Type diplôme`)) %>% 
  # filter(is.na(`Type diplôme`)) 
  # distinct(code_certification,CFD)
  group_by(`Type diplôme`,Filiere,Couverture_insertion) %>% 
  summarise(nb=n()) %>% 
  pivot_wider(names_from = Couverture_insertion,values_from = nb) %>% 
  mutate_all(replace_na,0) %>% 
  rowwise()  %>% 
  mutate(
    `Non couvert`=sum(c_across(contains("Non couvert")))
  ) %>% 
  ungroup() %>% 
  setNames(c("Type diplôme","Filiere",paste0(setdiff(names(.),c("Type diplôme","Filiere"))," (nb)"))) %>% 
  select(
    c("Type diplôme",
      "Filiere", 
      "Couvert (nb)",
      "Non couvert (nb)",
      "Non couvert - Sous le seuil de 20 élèves (nb)",
      "Non couvert - Nouvelle formation (nb)", 
      "Non couvert - code certification inconnu (nb)",
      "Non couvert - UAI Inconnu (nb)",
      "Non couvert - Territoire mal couvert (nb)",
      "Non couvert - Sans raison évidente (nb)" )
  ) %>% 
  left_join(
    Catalogue_affelnet_SLA_simpli %>% 
      left_join(
        n_formation_diplome %>% 
          select(FORMATION_DIPLOME,NIVEAU_FORMATION_DIPLOME,LIBELLE_COURT),
        by=c("CFD"="FORMATION_DIPLOME")
      ) %>% 
      mutate(
        `Type diplôme`=case_when(
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
          # type_formation=="Niveau inconnu"~"Inconnu",
          T~LIBELLE_COURT
        ),
        Filiere=ifelse(str_detect(code_certification,"MEFSTAT11:"),"Sco.","App.")
      ) %>% 
      left_join(
        affelnet_insertion %>% 
          select(CODEFORMATIONACCUEIL,Couverture_insertion),
        by="CODEFORMATIONACCUEIL"
      ) %>% 
      mutate(`Type diplôme`=ifelse(is.na(`Type diplôme`),"Inconnu",`Type diplôme`)) %>% 
      # filter(is.na(`Type diplôme`)) 
      # distinct(code_certification,CFD)
      group_by(`Type diplôme`,Filiere,Couverture_insertion) %>% 
      summarise(part=n()) %>% 
      mutate(part=prop.table(part)) %>% 
      pivot_wider(names_from = Couverture_insertion,values_from = part) %>% 
      mutate_all(replace_na,0) %>% 
      rowwise() %>% 
      mutate(
        `Non couvert`=sum(c_across(contains("Non couvert")))
      ) %>% 
      ungroup() %>% 
      setNames(c("Type diplôme","Filiere",paste0(setdiff(names(.),c("Type diplôme","Filiere"))," (%)"))) %>% 
      select(
        c("Type diplôme",
          "Filiere", 
          "Couvert (%)",
          "Non couvert (%)",
          "Non couvert - Sous le seuil de 20 élèves (%)",
          "Non couvert - Nouvelle formation (%)", 
          "Non couvert - code certification inconnu (%)",
          "Non couvert - UAI Inconnu (%)",
          "Non couvert - Territoire mal couvert (%)",
          "Non couvert - Sans raison évidente (%)" )
      ) ,
    by=c("Type diplôme","Filiere")
  ) %>% 
  select(
    c("Type diplôme",
      "Filiere", 
      "Couvert (nb)",
      "Couvert (%)",
      "Non couvert (nb)",
      "Non couvert (%)",
      "Non couvert - Sous le seuil de 20 élèves (nb)",
      "Non couvert - Sous le seuil de 20 élèves (%)",
      "Non couvert - Nouvelle formation (nb)", 
      "Non couvert - Nouvelle formation (%)", 
      "Non couvert - code certification inconnu (nb)",
      "Non couvert - code certification inconnu (%)",
      "Non couvert - UAI Inconnu (nb)",
      "Non couvert - UAI Inconnu (%)",
      "Non couvert - Territoire mal couvert (nb)",
      "Non couvert - Territoire mal couvert (%)",
      # "Non couvert - Plusieurs formations en annéee terminale associées (nb)",
      # "Non couvert - Plusieurs formations en annéee terminale associées (%)",
      # "Non couvert - Plusieurs certifications associées au départ dont une seule est couverte (nb)",
      # "Non couvert - Plusieurs certifications associées au départ dont une seule est couverte (%)",
      "Non couvert - Sans raison évidente (nb)",
      "Non couvert - Sans raison évidente (%)"
    )
  ) 




### Ajout des proportions par catégorie de couverture ----
# Transformation en pourcentages des différentes catégories de couverture

stats_catalogue_affelnet_2025<- NULL

stats_catalogue_affelnet_2025$stats_catalogue_partenaire <- Catalogue_affelnet_SLA_simpli %>% 
  left_join(
    n_formation_diplome %>% 
      select(FORMATION_DIPLOME,NIVEAU_FORMATION_DIPLOME,LIBELLE_COURT),
    by=c("CFD"="FORMATION_DIPLOME")
  ) %>% 
  mutate(
    `Type diplôme`=case_when(
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
      # type_formation=="Niveau inconnu"~"Inconnu",
      T~LIBELLE_COURT
    ),
    Filiere=ifelse(str_detect(code_certification,"MEFSTAT11:"),"Sco.","App."),
    `Type diplôme`=ifelse(is.na(`Type diplôme`),"Inconnu",`Type diplôme`)
  ) %>% 
  group_by(`Type diplôme`,Filiere) %>% 
  summarise("Nombre de formations"=n()) %>% 
  ungroup() %>% 
  mutate("Part du  catalogue"=prop.table(`Nombre de formations`)) %>% 
  left_join(stats_catalogue_affelnet_couverture,
            by=c("Type diplôme","Filiere"))



stats_catalogue_affelnet_2025$stats_catalogue_partenaire <- stats_catalogue_affelnet_2025$stats_catalogue_partenaire %>% 
  bind_rows(
    stats_catalogue_affelnet_2025$stats_catalogue_partenaire %>% 
      summarise_if(is.numeric,sum,na.rm=T) %>% 
      mutate(
        `Type diplôme`="Total",
        Filiere="Total",
        `Couvert (%)`=`Couvert (nb)`/`Nombre de formations`, 
        `Non couvert (%)`=`Non couvert (nb)`/`Nombre de formations`, 
        `Non couvert - Sous le seuil de 20 élèves (%)`=`Non couvert - Sous le seuil de 20 élèves (nb)`/`Nombre de formations`, 
        `Non couvert - Nouvelle formation (%)`=`Non couvert - Nouvelle formation (nb)`/`Nombre de formations`, 
        `Non couvert - code certification inconnu (%)`=`Non couvert - code certification inconnu (nb)`/`Nombre de formations`, 
        `Non couvert - UAI Inconnu (%)`=`Non couvert - UAI Inconnu (nb)`/`Nombre de formations`, 
        `Non couvert - Territoire mal couvert (%)`=`Non couvert - Territoire mal couvert (nb)`/`Nombre de formations`, 
        # `Non couvert - Plusieurs formations en annéee terminale associées (%)`=`Non couvert - Plusieurs formations en annéee terminale associées (nb)`/`Nombre de formations`,
        # `Non couvert - Plusieurs certifications associées au départ dont une seule est couverte (%)`=`Non couvert - Plusieurs certifications associées au départ dont une seule est couverte (nb)`/`Nombre de formations`,
        `Non couvert - Sans raison évidente (%)`=`Non couvert - Sans raison évidente (nb)`/`Nombre de formations`
      )        
  )


### Synthèse des statistiques de couverture ----
# Regroupement des statistiques sur la couverture des formations par campagne


stats_catalogue_affelnet_couverture_synthese <- Catalogue_affelnet_SLA_simpli %>% 
  left_join(
    n_formation_diplome %>% 
      select(FORMATION_DIPLOME,NIVEAU_FORMATION_DIPLOME,LIBELLE_COURT),
    by=c("CFD"="FORMATION_DIPLOME")
  ) %>% 
  mutate(
    `Type diplôme`=case_when(
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
      # type_formation=="Niveau inconnu"~"Inconnu",
      T~LIBELLE_COURT
    ),
    Filiere=ifelse(str_detect(code_certification,"MEFSTAT11:"),"Sco.","App.")
  ) %>% 
  left_join(
    affelnet_insertion %>% 
      select(CODEFORMATIONACCUEIL,Couverture_insertion),
    by="CODEFORMATIONACCUEIL"
  ) %>% 
  mutate(`Type diplôme`=ifelse(is.na(`Type diplôme`),"Inconnu",`Type diplôme`)) %>% 
  # filter(is.na(`Type diplôme`)) 
  # distinct(code_certification,CFD)
  group_by(Filiere,Couverture_insertion) %>% 
  summarise(nb=n()) %>% 
  pivot_wider(names_from = Couverture_insertion,values_from = nb) %>% 
  mutate_all(replace_na,0) %>% 
  rowwise()  %>% 
  mutate(
    `Non couvert`=sum(c_across(contains("Non couvert")))
  ) %>% 
  ungroup() %>% 
  setNames(c("Filiere",paste0(setdiff(names(.),c("Filiere"))," (nb)"))) %>% 
  select(
    c(
      "Filiere", 
      "Couvert (nb)",
      "Non couvert (nb)",
      "Non couvert - Sous le seuil de 20 élèves (nb)",
      "Non couvert - Nouvelle formation (nb)", 
      "Non couvert - code certification inconnu (nb)",
      "Non couvert - UAI Inconnu (nb)",
      "Non couvert - Territoire mal couvert (nb)",
      "Non couvert - Sans raison évidente (nb)" )
  ) %>% 
  left_join(
    Catalogue_affelnet_SLA_simpli %>% 
      left_join(
        n_formation_diplome %>% 
          select(FORMATION_DIPLOME,NIVEAU_FORMATION_DIPLOME,LIBELLE_COURT),
        by=c("CFD"="FORMATION_DIPLOME")
      ) %>% 
      mutate(
        `Type diplôme`=case_when(
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
          # type_formation=="Niveau inconnu"~"Inconnu",
          T~LIBELLE_COURT
        ),
        Filiere=ifelse(str_detect(code_certification,"MEFSTAT11:"),"Sco.","App.")
      ) %>% 
      left_join(
        affelnet_insertion %>% 
          select(CODEFORMATIONACCUEIL,Couverture_insertion),
        by="CODEFORMATIONACCUEIL"
      ) %>% 
      mutate(`Type diplôme`=ifelse(is.na(`Type diplôme`),"Inconnu",`Type diplôme`)) %>% 
      # filter(is.na(`Type diplôme`)) 
      # distinct(code_certification,CFD)
      group_by(Filiere,Couverture_insertion) %>% 
      summarise(part=n()) %>% 
      mutate(part=prop.table(part)) %>% 
      pivot_wider(names_from = Couverture_insertion,values_from = part) %>% 
      mutate_all(replace_na,0) %>% 
      rowwise() %>% 
      mutate(
        `Non couvert`=sum(c_across(contains("Non couvert")))
      ) %>% 
      ungroup() %>% 
      setNames(c("Filiere",paste0(setdiff(names(.),c("Filiere"))," (%)"))) %>% 
      select(
        c(
          "Filiere", 
          "Couvert (%)",
          "Non couvert (%)",
          "Non couvert - Sous le seuil de 20 élèves (%)",
          "Non couvert - Nouvelle formation (%)", 
          "Non couvert - code certification inconnu (%)",
          "Non couvert - UAI Inconnu (%)",
          "Non couvert - Territoire mal couvert (%)",
          "Non couvert - Sans raison évidente (%)" )
      ) ,
    by=c("Filiere")
  ) %>% 
  select(
    c(
      "Filiere", 
      "Couvert (nb)",
      "Couvert (%)",
      "Non couvert (nb)",
      "Non couvert (%)",
      "Non couvert - Sous le seuil de 20 élèves (nb)",
      "Non couvert - Sous le seuil de 20 élèves (%)",
      "Non couvert - Nouvelle formation (nb)", 
      "Non couvert - Nouvelle formation (%)", 
      "Non couvert - code certification inconnu (nb)",
      "Non couvert - code certification inconnu (%)",
      "Non couvert - UAI Inconnu (nb)",
      "Non couvert - UAI Inconnu (%)",
      "Non couvert - Territoire mal couvert (nb)",
      "Non couvert - Territoire mal couvert (%)",
      # "Non couvert - Plusieurs formations en annéee terminale associées (nb)",
      # "Non couvert - Plusieurs formations en annéee terminale associées (%)",
      # "Non couvert - Plusieurs certifications associées au départ dont une seule est couverte (nb)",
      # "Non couvert - Plusieurs certifications associées au départ dont une seule est couverte (%)",
      "Non couvert - Sans raison évidente (nb)",
      "Non couvert - Sans raison évidente (%)"
    )
  ) 


stats_catalogue_affelnet_campagne_2025_synthese <- NULL

stats_catalogue_affelnet_campagne_2025_synthese$stats_catalogue_partenaire <- Catalogue_affelnet_SLA_simpli %>% 
  left_join(
    n_formation_diplome %>% 
      select(FORMATION_DIPLOME,NIVEAU_FORMATION_DIPLOME,LIBELLE_COURT),
    by=c("CFD"="FORMATION_DIPLOME")
  ) %>% 
  mutate(
    `Type diplôme`=case_when(
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
      # type_formation=="Niveau inconnu"~"Inconnu",
      T~LIBELLE_COURT
    ),
    Filiere=ifelse(str_detect(code_certification,"MEFSTAT11:"),"Sco.","App.")
  ) %>% 
  left_join(
    affelnet_insertion %>% 
      select(CODEFORMATIONACCUEIL,Couverture_insertion),
    by="CODEFORMATIONACCUEIL"
  ) %>% 
  mutate(`Type diplôme`=ifelse(is.na(`Type diplôme`),"Inconnu",`Type diplôme`)) %>% 
  # filter(is.na(`Type diplôme`)) 
  # distinct(code_certification,CFD)
  group_by(Filiere) %>% 
  summarise("Nombre de formations"=n()) %>% 
  ungroup() %>% 
  mutate("Part du  catalogue"=prop.table(`Nombre de formations`)) %>% 
  left_join(stats_catalogue_affelnet_couverture_synthese,
            by=c("Filiere"))



stats_catalogue_affelnet_campagne_2025_synthese$stats_catalogue_partenaire  <- stats_catalogue_affelnet_campagne_2025_synthese$stats_catalogue_partenaire  %>% 
  bind_rows(  stats_catalogue_affelnet_campagne_2025_synthese$stats_catalogue_partenaire  %>% 
                summarise_if(is.numeric,sum,na.rm=T) %>% 
                mutate(
                  `Filiere`="Ensemble catalogue",
                  `Couvert (%)`=`Couvert (nb)`/`Nombre de formations`, 
                  `Non couvert (%)`=`Non couvert (nb)`/`Nombre de formations`, 
                  `Non couvert - Sous le seuil de 20 élèves (%)`=`Non couvert - Sous le seuil de 20 élèves (nb)`/`Nombre de formations`, 
                  `Non couvert - Nouvelle formation (%)`=`Non couvert - Nouvelle formation (nb)`/`Nombre de formations`, 
                  `Non couvert - code certification inconnu (%)`=`Non couvert - code certification inconnu (nb)`/`Nombre de formations`, 
                  `Non couvert - UAI Inconnu (%)`=`Non couvert - UAI Inconnu (nb)`/`Nombre de formations`, 
                  `Non couvert - Territoire mal couvert (%)`=`Non couvert - Territoire mal couvert (nb)`/`Nombre de formations`, 
                  # `Non couvert - Plusieurs formations en annéee terminale associées (%)`=`Non couvert - Plusieurs formations en annéee terminale associées (nb)`/`Nombre de formations`,
                  # `Non couvert - Plusieurs certifications associées au départ dont une seule est couverte (%)`=`Non couvert - Plusieurs certifications associées au départ dont une seule est couverte (nb)`/`Nombre de formations`,
                  `Non couvert - Sans raison évidente (%)`=`Non couvert - Sans raison évidente (nb)`/`Nombre de formations`
                )   
  )









