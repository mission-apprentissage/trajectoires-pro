# Script d'appariement des formations aux données d'insertion traitées par la DEPP et le SIES 
# 
# Ce script tente de faire correspondre les données de formations avec les données de la DEPP et du SIES
# Il explore plusieurs types d'appariements :
#   - normal: Basé sur les codes CFD et MEFSTAT11
#   - MNE: Basé sur la clé des ministères éducatifs
#   - Certif-Infos: Basé sur les codes Certif-Infos
#   - RNCP: Basé sur les codes RNCP
#   - IDEO: Basé sur les codes IDEO
# 
# Pour les formations mixtes (alternance + scolaire), Exposition ne remonte souvent les données que pour une seule des voies.
# Un test inversé est donc réalisé pour essayer de récupérer les informations manquantes.

choix_api_exposition <- "recette"

urls <- list(
  exposition_ij= list(
    production = "https://exposition.inserjeunes.beta.gouv.fr",
    recette = "https://recette.exposition.inserjeunes.incubateur.net"
  )
)


ensemble_key <- readRDS("../../../../../Groupe-002 - Parcoursup/002 - 4 - Prepa ParcourSup 2025/data/ensemble_key.rds") #les clés peuvent être stockées dans un fichier si nécéssaire
apiKey_ij <- ensemble_key$apiKey_ij
token_ci <- ensemble_key$token_ci

## Import des données d'Insertion d'Exposition ----

code_region <- c("84", "32", "93", "44", "76", "28", "75", "24", "27", "53", 
                 "52", "11", "94", "01", "02", "03", "04", "06", "00")

forma_test_api_json_route_formation <- map_dfr(code_region,function(x){
  print(x)
  url_reg <- paste0(urls$exposition_ij[[choix_api_exposition]],"/api/inserjeunes/formations?items_par_page=999999&apiKey=",apiKey_ij,"&regions=",x)
  forma_test_api_json_route_formation_reg <- jsonlite::fromJSON(url_reg)
  forma_test_api_json_route_formation_reg <- forma_test_api_json_route_formation_reg$formations %>%
    as_tibble()
  return(forma_test_api_json_route_formation_reg)
})



data_meta_formationsStats_init <- forma_test_api_json_route_formation %>%
  setNames(names(.) %>%
             str_to_lower() %>%
             str_replace_all(" ", "_"))


data_meta_formationsStats_init_annee_terminales <-    data_meta_formationsStats_init %>%
  unnest(certificationsterminales,names_sep = "certificationsterminales") %>%
  select(code_certification,certificationsterminalescertificationsterminalescode_certification,uai,millesime) %>% 
  left_join(data_meta_formationsStats_init,
            by=c("certificationsterminalescertificationsterminalescode_certification"="code_certification","uai","millesime")) %>% 
  select(-certificationsterminalescertificationsterminalescode_certification)


data_meta_formationsStats_init <- data_meta_formationsStats_init %>% 
  anti_join(data_meta_formationsStats_init_annee_terminales,
            by=c("code_certification","uai","millesime")) %>% 
  bind_rows(
    data_meta_formationsStats_init_annee_terminales    
  )


data_meta_formationsStats_init <- data_meta_formationsStats_init %>%
  mutate(
    id_unique = paste0(data_meta_formationsStats_init$donnee_source$code_certification,"_",ifelse(is.na(uai_donnee),uai,uai_donnee),"_",millesime),
    code_certification_source=data_meta_formationsStats_init$donnee_source$code_certification, 
    type_source=data_meta_formationsStats_init$donnee_source$type,
    niveau_diplome=data_meta_formationsStats_init$diplome$code,
    libelle_type_diplome=data_meta_formationsStats_init$diplome$libelle,
    "Couverture Taux En Emploi 6 Mois" = ifelse(is.na(taux_en_emploi_6_mois), F, T),
    "Couverture Taux Autres 6 Mois" = ifelse(is.na(taux_autres_6_mois), F, T),
    "Couverture Taux En poursuite" = ifelse(is.na(taux_en_formation), F, T)
  ) %>% 
  distinct(
    id_unique,
    code_certification ,
    code_formation_diplome,
    uai,
    uai_type,
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
           nb_annee_term < 20 ~ "Sous le seuil de 20 élèves",
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
  ) 


ensemble_data_formationsStats <- data_meta_formationsStats_init %>% 
  mutate(code_certification=case_when(
    filiere =="pro" ~paste0("MEFSTAT11:",code_certification),
    filiere =="apprentissage" ~paste0("CFD:",code_certification),
    filiere =="superieur" ~paste0("SISE:",code_certification),
  ))

### Identification des derniers millésimes disponibles dans Exposition par filière ----


millesime_ij <- data_meta_formationsStats_init %>%
  group_by(filiere) %>% 
  distinct(millesime)


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
                                          filter(filiere=="superieur") %>% 
                                          pull(millesime) %>% 
                                          unique() %>% 
                                          as.numeric())) %>% 
  distinct(FORMATION_DIPLOME) %>% 
  pull(FORMATION_DIPLOME)


### Identification des établissements ouverts au moment de la diffusion des millésimes ----

ACCE_UAI <- ACCE_UAI %>% 
  as_tibble() %>% 
  mutate_at(vars(date_ouverture,date_fermeture),
            as.Date,format="%d/%m/%Y") %>% 
  filter(lubridate::year(date_fermeture)>=max(millesime_ij$millesime)|is.na(date_fermeture)) %>% 
  filter(lubridate::year(date_ouverture)<=max(millesime_ij$millesime)|is.na(date_ouverture)) %>% 
  select(numero_uai,academie)


