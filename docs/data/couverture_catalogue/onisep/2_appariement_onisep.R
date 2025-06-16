n_mef_custom_IJ_familles_metiers_pour_affelnet <- read_excel("C:/Users/arnau/d-sidd Dropbox/Arnaud milet/0_beta/1- Exposition/7- Famille de métiers/n_mef_custom_IJ_familles_metiers_pour_affelnet.xlsx")

# onisep 05_2025----


ideo_actions_de_formation_initiale_univers_lycee <-  jsonlite::fromJSON("https://api.opendata.onisep.fr/downloads/605340ddc19a9/605340ddc19a9.json") %>% 
  as_tibble() %>% 
  mutate_all(~ifelse(.=="",NA,.))

ideo_formations_initiales_en_france <-  jsonlite::fromJSON("https://api.opendata.onisep.fr/downloads/5fa591127f501/5fa591127f501.json") %>% 
  as_tibble() %>% 
  mutate_all(~ifelse(.=="",NA,.))


ideo_actions_de_formation_initiale_univers_lycee_rens <- ideo_actions_de_formation_initiale_univers_lycee %>% 
  left_join(
    ideo_formations_initiales_en_france %>% 
      distinct(code_scolarite,url_et_id_onisep,duree),
    by=c("for_url_et_id_onisep"="url_et_id_onisep")
  ) %>% 
  mutate(
    duree=as.numeric(str_split_fixed(duree," ",n=2)[,1]),
    unite_duree=str_split_fixed(duree," ",n=2)[,2]
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
    by=c("duree"="DUREE_DISPOSITIF","code_scolarite"="FORMATION_DIPLOME")
  ) %>% 
  mutate(Filiere="Scolaire") 


ideo_actions_de_formation_initiale_univers_lycee_rens <- ideo_actions_de_formation_initiale_univers_lycee_rens %>%
  left_join(
    n_mef %>%
      filter(ANNEE_DISPOSITIF==1) %>%
      select(FORMATION_DIPLOME,DUREE_DISPOSITIF,MEF_STAT_11) %>% 
      rename(MEF_STAT_11_voeux=MEF_STAT_11),
    by=c("code_scolarite"="FORMATION_DIPLOME","duree"="DUREE_DISPOSITIF")
  )  %>%
  mutate(mefstat_voeux_classe=as.numeric(str_sub(MEF_STAT_11_voeux,4,4))) %>%
  group_by(action_de_formation_af_identifiant_onisep) %>%
  filter(mefstat_voeux_classe==min(mefstat_voeux_classe)) %>% 
  ungroup() %>%
  select(-mefstat_voeux_classe,-duree) %>%
  ungroup() 


ideo_actions_de_formation_initiale_univers_lycee_simpli <- ideo_actions_de_formation_initiale_univers_lycee_rens %>% 
  filter(!is.na(MEF_STAT_11)) %>% 
  select(ens_code_uai,MEF_STAT_11,MEF_STAT_11_voeux,Filiere) %>% 
  setNames(c("UAI","MEFSTAT11","MEFSTAT11_voeux","Filiere")) %>%
  mutate(code_certification=paste0("MEFSTAT11:",MEFSTAT11)) %>% 
  rename("uai"="UAI") %>% 
  distinct() %>% 
  mutate(CODEFORMATIONACCUEIL=paste0(uai,"_",code_certification))


## Appariement avec les données InserJeunes ----

onisep_prepa_insertion_couvert <- ideo_actions_de_formation_initiale_univers_lycee_simpli %>% 
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


onisep_prepa_insertion_non_couvert <- ideo_actions_de_formation_initiale_univers_lycee_simpli %>% 
  anti_join(
    onisep_prepa_insertion_couvert,
    by=c("CODEFORMATIONACCUEIL")
    ) %>% 
  mutate(
    Couverture="Non couvert"
  ) 


onisep_insertion <- onisep_prepa_insertion_couvert %>% 
  mutate_at(vars(nb_annee_term,taux_en_emploi_6_mois,taux_en_formation,taux_autres_6_mois),~ifelse(Couverture!="Couvert",NA,.)) %>% 
  distinct(CODEFORMATIONACCUEIL,uai,code_certification,MEFSTAT11_voeux,Couverture,nb_annee_term,taux_en_emploi_6_mois,taux_en_formation,taux_autres_6_mois) %>% 
  bind_rows(
    onisep_prepa_insertion_non_couvert %>% 
      distinct(CODEFORMATIONACCUEIL,uai,code_certification,MEFSTAT11_voeux,Couverture)
  ) %>% 
  select(CODEFORMATIONACCUEIL,uai,code_certification,MEFSTAT11_voeux,taux_en_emploi_6_mois,taux_en_formation,taux_autres_6_mois,Couverture) %>%  
  rename(
    code_certification_insertion=code_certification,
    Couverture_insertion=Couverture
  )  



onisep_insertion 
onisep_insertion %>% 
  mutate(Couverture_insertion=ifelse(
    code_certification_insertion %in% (n_mef_custom_IJ_familles_metiers_pour_affelnet %>% 
                                         mutate(code_certification=paste0("MEFSTAT11:",MEF_STAT_11)) %>% 
                                         distinct(code_certification) %>% 
                                         pull(code_certification)) & Couverture_insertion=="Non couvert - Plusieurs codes certification associés",
    "Couvert",
    Couverture_insertion
  )) %>% 
  group_by(Couverture_insertion) %>% 
  summarise(nb=n()) %>% 
  bind_rows(summarise(.,nb=sum(nb)) %>% 
              mutate(Couverture_insertion="Total"))


onisep_insertion %>% 
  group_by(Couverture_insertion) %>% 
  summarise(nb=n()) %>% 
  bind_rows(summarise(.,nb=sum(nb)) %>% 
              mutate(Couverture_insertion="Total"))

