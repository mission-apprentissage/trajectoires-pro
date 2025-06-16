formation_catalogue_apprentissage <- data.table::fread(file.path(chemin_racine_data,"/catalogue MNE/catalogue_mne.csv")) %>% 
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
  select(UAI,`Formation: code CFD`,`Formation: durée collectée`,`Clé ministere educatif`) %>% 
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
  mutate(MEFSTAT11=ifelse(is.na(MEF_STAT_11_recherche_1),MEF_STAT_11_recherche_2,MEF_STAT_11_recherche_1)) %>% 
  select(UAI,CFD,Filiere,MEFSTAT11,CODEFORMATIONACCUEIL)%>%
  mutate(code_certification=paste0("CFD:",CFD)) %>% 
  rename("uai"="UAI") %>% 
  distinct()



## Appariement avec les données InserJeunes ----

catalogue_apprentissage_prepa_insertion_couvert <- formation_catalogue_apprentissage_simpli %>% 
  inner_join(
    ensemble_data_formationsStats %>%
      select(uai,code_certification,nb_annee_term,taux_en_emploi_6_mois,taux_en_formation,taux_autres_6_mois,Couverture) %>%
      distinct(),
    by=c("uai","code_certification"))  %>%  
  group_by(CODEFORMATIONACCUEIL) %>%
  mutate(
    Couverture=case_when(
      n() > 1 ~"Non couvert - Plusieurs codes certification associés",
      Couverture =="Sous le seuil de 20 élèves" ~ "Non couvert - Sous le seuil de 20 élèves",
      Couverture =="Non couvert" ~ "Non couvert - Sans raison évidente",
      # validite_code_certification == "Non valide - Plusieurs codes certification associés" ~ "Non couvert - Plusieurs certifications associées au départ dont une seule est couverte",
      T~Couverture
    )
  ) %>% 
  ungroup() 


catalogue_apprentissage_prepa_insertion_non_couvert <- formation_catalogue_apprentissage_simpli %>% 
  anti_join(
    catalogue_apprentissage_prepa_insertion_couvert,
    by=c("CODEFORMATIONACCUEIL")
  ) %>% 
  mutate(
    Couverture="Non couvert"
  ) 


catalogue_apprentissage_insertion <- catalogue_apprentissage_prepa_insertion_couvert %>% 
  mutate_at(vars(nb_annee_term,taux_en_emploi_6_mois,taux_en_formation,taux_autres_6_mois),~ifelse(Couverture!="Couvert",NA,.)) %>% 
  distinct(CODEFORMATIONACCUEIL,uai,code_certification,Couverture,nb_annee_term,taux_en_emploi_6_mois,taux_en_formation,taux_autres_6_mois) %>% 
  bind_rows(
    catalogue_apprentissage_prepa_insertion_non_couvert %>% 
      distinct(CODEFORMATIONACCUEIL,uai,code_certification,Couverture)
  ) %>% 
  select(CODEFORMATIONACCUEIL,uai,code_certification,taux_en_emploi_6_mois,taux_en_formation,taux_autres_6_mois,Couverture) %>%  
  rename(
    code_certification_insertion=code_certification,
    Couverture_insertion=Couverture
  )  


catalogue_apprentissage_insertion %>% 
  group_by(Couverture_insertion) %>% 
  summarise(nb=n()) %>% 
  bind_rows(summarise(.,nb=sum(nb)) %>% 
              mutate(Couverture_insertion="Total"))
