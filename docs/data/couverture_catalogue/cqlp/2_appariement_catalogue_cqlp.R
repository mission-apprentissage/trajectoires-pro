n_mef_custom_IJ_familles_metiers_pour_affelnet <- read_excel("C:/Users/arnau/d-sidd Dropbox/Arnaud milet/0_beta/1- Exposition/7- Famille de métiers/n_mef_custom_IJ_familles_metiers_pour_affelnet.xlsx")

# recette ----
FormationEtablissement_recette <- read_csv(file.path(chemin_racine_data,"Donnees IJ/metabase/Recette - CQLP/FormationEtablissement.csv"))
Formation_recette <- read_csv(file.path(chemin_racine_data,"Donnees IJ/metabase/Recette - CQLP/Formation.csv"))
Etablissement_recette <- read_csv(file.path(chemin_racine_data,"Donnees IJ/metabase/Recette - CQLP/Etablissement.csv"))

FormationEtablissement_simpli_recette <- FormationEtablissement_recette %>% 
  left_join(
    Formation_recette %>% 
      select(ID,Cfd,Mef11,Voie) %>% 
      mutate(Mef11=paste0(str_sub(Mef11,1,3),1,str_sub(Mef11,5,11))) %>% #Passage systématique en code 1ere année
      mutate(code_certification=ifelse(Voie=="scolaire",Mef11,Cfd)),
    by=c("FormationId"="ID")
  ) %>% 
  left_join(
    Etablissement_recette %>% 
      select(ID,Uai,Academie,Region),
    by=c("EtablissementId"="ID")
  ) %>% 
  select(ID,Uai,Cfd,Mef11,Voie) %>% 
  mutate(code_certification=case_when(
    Voie =="scolaire" ~paste0("MEFSTAT11:",Mef11),
    Voie =="apprentissage" ~paste0("CFD:",Cfd)
  )) %>% 
  rename("uai"="Uai",
         "CODEFORMATIONACCUEIL"="ID") %>% 
  distinct()



## Appariement avec les données InserJeunes ----

catalogue_cqlp_prepa_insertion_couvert <- FormationEtablissement_simpli_recette %>% 
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


catalogue_cqlp_prepa_insertion_non_couvert <- FormationEtablissement_simpli_recette %>% 
  anti_join(
    catalogue_cqlp_prepa_insertion_couvert,
    by=c("CODEFORMATIONACCUEIL")
  ) %>% 
  mutate(
    Couverture="Non couvert"
  ) 


catalogue_cqlp_insertion <- catalogue_cqlp_prepa_insertion_couvert %>% 
  mutate_at(vars(nb_annee_term,taux_en_emploi_6_mois,taux_en_formation,taux_autres_6_mois),~ifelse(Couverture!="Couvert",NA,.)) %>% 
  distinct(CODEFORMATIONACCUEIL,uai,code_certification,Couverture,nb_annee_term,taux_en_emploi_6_mois,taux_en_formation,taux_autres_6_mois) %>% 
  bind_rows(
    catalogue_cqlp_prepa_insertion_non_couvert %>% 
      distinct(CODEFORMATIONACCUEIL,uai,code_certification,Couverture)
  ) %>% 
  select(CODEFORMATIONACCUEIL,uai,code_certification,taux_en_emploi_6_mois,taux_en_formation,taux_autres_6_mois,Couverture) %>%  
  rename(
    code_certification_insertion=code_certification,
    Couverture_insertion=Couverture
  )  


catalogue_cqlp_insertion <- catalogue_cqlp_insertion %>% 
  mutate(Couverture_insertion=ifelse(
    code_certification_insertion %in% (n_mef_custom_IJ_familles_metiers_pour_affelnet %>% 
                                         mutate(code_certification=paste0("MEFSTAT11:",MEF_STAT_11)) %>% 
                                         distinct(code_certification) %>% 
                                         pull(code_certification)) & Couverture_insertion=="Non couvert - Plusieurs codes certification associés",
    "Couvert",
    Couverture_insertion
  )) 

catalogue_cqlp_insertion %>% 
  group_by(Couverture_insertion) %>% 
  summarise(nb=n()) %>% 
  bind_rows(summarise(.,nb=sum(nb)) %>% 
              mutate(Couverture_insertion="Total"))
