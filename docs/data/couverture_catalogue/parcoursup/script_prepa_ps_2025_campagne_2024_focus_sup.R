# parcoursup_campagne_2024 <- read_excel(file.path(chemin_racine_data,"parcoursup/2024/listeFormationsInserJeunes_finSession2024_01_10_2024.xls"))

parcoursup_campagne_2024_sup <- parcoursup_campagne_2024 %>% 
  filter(CODEFORMATION %in% c(89000,89100,89200,3001:3013))


parcoursup_campagne_2024_sup_sortie_sise <- parcoursup_campagne_2024_sup %>% 
  filter(!is.na(CODESISE)& CODESISE%in%n_diplome_sise$DIPLOME_SISE) %>% 
  distinct(CODEFORMATIONACCUEIL,CODESISE,UAI_GES,UAI_COMPOSANTE,UAI_AFF) %>% 
  pivot_longer(cols = contains("UAI"),values_to = "uai") %>%
  select(-name) %>% 
  distinct() %>% 
  left_join(
    data_meta_formationsStats_init %>%
      filter(filiere=="superieur",millesime=="2022") %>% 
      distinct(code_certification,uai,taux_en_emploi_6_mois,nb_annee_term ),
    by=c("uai","CODESISE"="code_certification")
  ) %>%  
  distinct(CODEFORMATIONACCUEIL,CODESISE,nb_annee_term,taux_en_emploi_6_mois) %>% 
  filter(!is.na(nb_annee_term)) %>%  
  group_by(CODEFORMATIONACCUEIL) %>% 
  filter(taux_en_emploi_6_mois==max(taux_en_emploi_6_mois)) %>% 
  ungroup() %>% 
  mutate(
    couverture=case_when(
      is.na(nb_annee_term)~"Non couvert",
      nb_annee_term<=20~"Sous les seuils",
      !is.na(taux_en_emploi_6_mois)~"Couvert",
      nb_annee_term>20~"Present dans IJ avec nb annee term >20 mais pas de taux en emploi"
    )
  )




parcoursup_campagne_2024_sup_avec_sise_retravailles <- parcoursup_campagne_2024_sup %>% 
  mutate(ideo=map(LISTE_IDEO,function(x){
    str_trim(unlist(str_split(x,";")))
  })) %>% 
  unnest(ideo) %>% 
  mutate(RNCP_via_parcoursup=map(LISTE_RNCP,function(x){
    str_trim(unlist(str_split(x,";")))
  })) %>% 
  unnest(RNCP_via_parcoursup) %>% 
  select(CODEFORMATIONACCUEIL,contains("UAI"),CODESISE,RNCP_via_parcoursup,ID_RCO,ideo) %>% 
  left_join(
    catalogue_mne %>% 
      select(`Clé ministere educatif`,`Formation: code RNCP`) %>% 
      rename(RNCP_via_MNE=`Formation: code RNCP`) %>% 
      mutate(RNCP_via_MNE =str_remove(RNCP_via_MNE,"RNCP")),
    by=c("ID_RCO"="Clé ministere educatif")
  ) %>% 
  left_join(
    ideo_formations_initiales_en_france_simpli %>% 
      rename(RNCP_via_ideo=`code RNCP`) %>% 
      mutate(RNCP_via_ideo=as.character(RNCP_via_ideo)),
    by=c("ideo")
  ) %>% 
  mutate(
    code_RNCP=case_when(
      !is.na(RNCP_via_parcoursup)~RNCP_via_parcoursup,
      !is.na(RNCP_via_MNE)~RNCP_via_MNE,
      !is.na(RNCP_via_ideo)~RNCP_via_ideo,
      T~"Aucun RNCP"
    ),
    type_RNCP=case_when(
      !is.na(RNCP_via_parcoursup)~"RNCP_via_parcoursup",
      !is.na(RNCP_via_MNE)~"RNCP_via_MNE",
      !is.na(RNCP_via_ideo)~"RNCP_via_ideo",
      T~"Aucun RNCP"
    ),
    type_RNCP=factor(type_RNCP,levels=c("RNCP_via_parcoursup","RNCP_via_MNE","RNCP_via_ideo","Aucun RNCP"))
  ) %>% 
  group_by(CODEFORMATIONACCUEIL) %>% 
  filter(as.numeric(type_RNCP)==max(as.numeric(type_RNCP))) %>% 
  ungroup() %>% 
  left_join(
    inserJeune_sise_rncp %>% 
      filter(!is.na(`Code Sise`)) %>% 
      mutate_all(as.character),
    by=c("code_RNCP"="Code RNCP")
  ) %>% 
  left_join(
    data_meta_formationsStats_init %>%
      filter(filiere=="superieur",millesime=="2022") %>% 
      distinct(code_certification,uai,taux_en_emploi_6_mois,nb_annee_term ) %>% 
      mutate(
        couverture_4=case_when(
          is.na(nb_annee_term)~"Non couvert",
          nb_annee_term<=20~"Sous les seuils",
          !is.na(taux_en_emploi_6_mois)~"Couvert",
          nb_annee_term>20~"Present dans IJ avec nb annee term >20 mais pas de taux en emploi"
        )
      ) %>% 
      distinct(code_certification ,uai,couverture_4),
    by=c("Code Sise"="code_certification","UAI_GES"="uai")
    ) %>% 
  mutate(couverture_4=replace_na(couverture_4,"Non couvert"),
         couverture_4=factor(couverture_4,levels=c("Couvert","Sous les seuils","Non couvert"))) %>% 
  left_join(
    parcoursup_campagne_2024_sup_sortie_sise %>% 
      select(CODEFORMATIONACCUEIL,couverture) %>% 
      # mutate(couverture=factor(couverture,levels=c("Couvert","Sous les seuils","Non couvert"))) %>% 
      rename(couverture_1=couverture),
    by="CODEFORMATIONACCUEIL"
  ) %>% 
  mutate(
    couverture_1=ifelse(is.na(couverture_1),"Non couvert",couverture_1),
    couverture_1=factor(couverture_1,levels=c("Couvert","Sous les seuils","Non couvert")),
    comparaison_sise=case_when(
      is.na(CODESISE) & is.na(`Code Sise`)~"Pas de code SISE initial & pas de code SISE final",
      is.na(CODESISE) ~ "Pas de code SISE initial",
      is.na(`Code Sise`) ~"Pas de code SISE final",
      CODESISE==`Code Sise`~"Code SISE identiques",
      CODESISE!=`Code Sise`~"Code SISE différents")
  )  %>% 
  left_join(
    data_meta_formationsStats_init %>%
      filter(filiere=="superieur",millesime=="2022") %>% 
      distinct(code_certification,uai,taux_en_emploi_6_mois,nb_annee_term ) %>% 
      mutate(
        couverture_3=case_when(
          is.na(nb_annee_term)~"Non couvert",
          nb_annee_term<=20~"Sous les seuils",
          !is.na(taux_en_emploi_6_mois)~"Couvert",
          nb_annee_term>20~"Present dans IJ avec nb annee term >20 mais pas de taux en emploi"
        )
      ) %>% 
      distinct(code_certification ,uai,couverture_3),
    by=c("CODESISE"="code_certification","UAI_GES"="uai")
  ) %>% 
  mutate(
    couverture_3=ifelse(is.na(couverture_3),"Non couvert",couverture_3),
    couverture_3=factor(couverture_3,levels=c("Couvert","Sous les seuils","Non couvert")),
  )


parcoursup_campagne_2024_sup_couverture_2 <-parcoursup_campagne_2024_sup_avec_sise_retravailles %>%
  distinct(CODEFORMATIONACCUEIL,UAI_GES,`Code Sise`) %>% 
  left_join(
    data_meta_formationsStats_init %>%
      filter(filiere=="superieur",millesime=="2022") %>% 
      distinct(code_certification,uai,taux_en_emploi_6_mois,nb_annee_term ),
    by=c("UAI_GES"="uai","Code Sise"="code_certification")
  ) %>% 
  distinct(CODEFORMATIONACCUEIL,nb_annee_term,taux_en_emploi_6_mois) %>% 
  filter(!is.na(nb_annee_term)) %>%
  group_by(CODEFORMATIONACCUEIL) %>% 
  filter(taux_en_emploi_6_mois==max(taux_en_emploi_6_mois)) %>% 
  ungroup() %>% 
  mutate(
    couverture_2=case_when(
      is.na(nb_annee_term)~"Non couvert",
      nb_annee_term<=20~"Sous les seuils",
      !is.na(taux_en_emploi_6_mois)~"Couvert",
      nb_annee_term>20~"Present dans IJ avec nb annee term >20 mais pas de taux en emploi"
    )
  ) %>% 
  distinct(CODEFORMATIONACCUEIL,couverture_2) 


parcoursup_campagne_2024_sup_avec_sise_retravailles <- parcoursup_campagne_2024_sup_avec_sise_retravailles %>% 
  left_join(parcoursup_campagne_2024_sup_couverture_2,
            by="CODEFORMATIONACCUEIL") %>% 
  mutate(
    couverture_2=ifelse(is.na(couverture_2),"Non couvert",couverture_2),
    couverture_2=factor(couverture_2,levels=c("Couvert","Sous les seuils","Non couvert")),
  )


parcoursup_campagne_2024_sup_avec_sise_hybride <- parcoursup_campagne_2024_sup_avec_sise_retravailles %>% 
  group_by(CODEFORMATIONACCUEIL) %>% 
  mutate(nb_sise=ifelse(n()>1,"Correspondance avec plusieurs SISE","Unique SISE"),
  ) %>% 
  filter(as.numeric(couverture_4)==min(as.numeric(couverture_4))) %>% 
  distinct(CODEFORMATIONACCUEIL,CODESISE,`Code Sise`,couverture_4,couverture_3) %>% 
  mutate(
    `Code Sise hybride`=case_when(
      couverture_3 %in% c("Couvert","Sous les seuils")  ~ CODESISE,
      T~`Code Sise`
    ),
    couverture_hybride=case_when(
      couverture_3 %in% c("Couvert","Sous les seuils") ~ couverture_3,
      T~couverture_4
    )
  ) %>% 
  mutate(
    couverture_hybride=factor(couverture_hybride,levels=c("Couvert","Sous les seuils","Non couvert"))
  ) %>% 
  group_by(CODEFORMATIONACCUEIL) %>% 
  filter(as.numeric(couverture_hybride)==min(as.numeric(couverture_hybride)))


parcoursup_campagne_2024_sup_a_transmettre_PS <-parcoursup_campagne_2024 %>% 
  filter(CODEFORMATIONACCUEIL %in% parcoursup_campagne_2024_sup$CODEFORMATIONACCUEIL) %>% 
  left_join(
    parcoursup_campagne_2024_sup_avec_sise_retravailles %>% 
      group_by(CODEFORMATIONACCUEIL) %>% 
      mutate(nb_sise=ifelse(n()>1,"Correspondance avec plusieurs SISE","Unique SISE"),
      ) %>% 
      filter(as.numeric(couverture_4)==min(as.numeric(couverture_4))) %>% 
      distinct(CODEFORMATIONACCUEIL,nb_sise,couverture_4,couverture_3,comparaison_sise) %>% 
      mutate(comparaison_sise=factor(comparaison_sise,
                                     levels=c("Code SISE identiques",
                                              "Code SISE différents",
                                              "Pas de code SISE initial & pas de code SISE final",
                                              "Pas de code SISE initial",
                                              "Pas de code SISE final")
      )
      ) %>% 
      filter(as.numeric(comparaison_sise)==min(as.numeric(comparaison_sise))) %>% 
      ungroup() %>% 
      mutate(
        couverture_4=case_when(nb_sise=="Correspondance avec plusieurs SISE" & couverture_4=="Couvert" ~ "Couvert avec plusieurs SISE",
                               nb_sise=="Correspondance avec plusieurs SISE" & couverture_4=="Sous les seuils" ~ "Sous les seuils avec plusieurs SISE",
                               nb_sise=="Correspondance avec plusieurs SISE" & couverture_4=="Non couvert" ~ "Non couvert avec plusieurs SISE",
                               T~couverture_4) 
      ) %>% 
      select(CODEFORMATIONACCUEIL,couverture_3,couverture_4,comparaison_sise) %>% 
      setNames(c("CODEFORMATIONACCUEIL","Couverture initiale","Couverture avec les codes RNCP, MNE ou Ideo","Comparaison des codes SISE")) %>%   
      left_join(
        parcoursup_campagne_2024_sup_avec_sise_retravailles %>% 
          select(CODEFORMATIONACCUEIL ,`Code Sise`) %>% 
          drop_na() %>% 
          group_by(CODEFORMATIONACCUEIL) %>% 
          nest() %>% 
          mutate(data=map_chr(data,function(x){
            paste0(unique(x$`Code Sise`),sep="",collapse = ";")
          }
          )) %>% 
          unnest() %>% 
          rename(`Code Sise Expo`=data) %>% 
          left_join(
            parcoursup_campagne_2024_sup_avec_sise_retravailles %>% 
              select(CODEFORMATIONACCUEIL ,`Code Sise`) %>% 
              left_join(
                inserJeune_certifinfo %>% 
                  select(`Intitule Certifinfo`,`Code Sise`) %>% 
                  drop_na(),
                by="Code Sise"
              ) %>% 
              drop_na()  %>% 
              select(-`Code Sise`) %>% 
              group_by(CODEFORMATIONACCUEIL) %>% 
              nest() %>% 
              mutate(data=map_chr(data,function(x){
                paste0(unique(x$`Intitule Certifinfo`),sep="",collapse = ";")
              }
              )) %>%   
              unnest() %>% 
              rename(`Intitule Certifinfo Expo`=data),
            by="CODEFORMATIONACCUEIL"
          ),
        by="CODEFORMATIONACCUEIL"
      )
  ) %>% 
  left_join(
    parcoursup_campagne_2024_sup_avec_sise_hybride %>%
      select(CODEFORMATIONACCUEIL,`Code Sise hybride`) %>% 
      group_by(CODEFORMATIONACCUEIL) %>% 
      nest() %>% 
      mutate(data=map_chr(data,function(x){
        paste0(unique(x$`Code Sise hybride`),sep="",collapse = ";")
      }
      )) %>% 
      unnest() %>% 
      rename(`Code Sise hybride`=data) %>% 
      left_join(
        parcoursup_campagne_2024_sup_avec_sise_hybride %>%
          distinct(CODEFORMATIONACCUEIL,couverture_hybride),
        by="CODEFORMATIONACCUEIL"
      ) %>% 
      mutate(
        nb_sise_hybride=ifelse(str_detect(`Code Sise hybride`,";"),"Correspondance avec plusieurs SISE","Unique SISE"),
        couverture_hybride =case_when(nb_sise_hybride=="Correspondance avec plusieurs SISE" & couverture_hybride =="Couvert" ~ "Couvert avec plusieurs SISE",
                                      nb_sise_hybride=="Correspondance avec plusieurs SISE" & couverture_hybride =="Sous les seuils" ~ "Sous les seuils avec plusieurs SISE",
                                      nb_sise_hybride=="Correspondance avec plusieurs SISE" & couverture_hybride =="Non couvert" ~ "Non couvert avec plusieurs SISE",
                                      T~couverture_hybride ),
        `Code Sise hybride`=ifelse(`Code Sise hybride`=="NA",NA,`Code Sise hybride`)
      ) %>% 
      select(-nb_sise_hybride),
    by="CODEFORMATIONACCUEIL"
  ) %>% 
  rename("Couverture avec code SISE initial PS"="Couverture initiale",
         "Couverture avec code SISE reconstruit à partir des codes RNCP, MNE ou Ideo"="Couverture avec les codes RNCP, MNE ou Ideo",
         "Comparaison du code SISE intial PS et du code SISE reconstruit à partir des codes RNCP, MNE ou Ideo"="Comparaison des codes SISE",
         "Code SISE reconstruit à partir des codes RNCP, MNE ou Ideo"="Code Sise Expo",
         "Libéllé SISE reconstruit à partir des codes RNCP, MNE ou Ideo issu de certif-Infos"="Intitule Certifinfo Expo",
         "Code SISE retenu"="Code Sise hybride",
         "Couverture avec code SISE retenu"="couverture_hybride",
         "Demandes tous voeux"="NBDEDEMANDES") %>% 
  select(1:23,
         "Demandes tous voeux",
         "Couverture avec code SISE initial PS", 
         "Code SISE reconstruit à partir des codes RNCP, MNE ou Ideo", 
         "Couverture avec code SISE reconstruit à partir des codes RNCP, MNE ou Ideo", 
         "Comparaison du code SISE intial PS et du code SISE reconstruit à partir des codes RNCP, MNE ou Ideo", 
         "Libéllé SISE reconstruit à partir des codes RNCP, MNE ou Ideo issu de certif-Infos", 
         "Code SISE retenu",
         "Couverture avec code SISE retenu")  %>% 
  mutate(
    `Couverture avec code SISE reconstruit à partir des codes RNCP, MNE ou Ideo`=case_when(
      `Couverture avec code SISE reconstruit à partir des codes RNCP, MNE ou Ideo`=="Non couvert avec plusieurs SISE"~"Non couvert",
      `Couverture avec code SISE reconstruit à partir des codes RNCP, MNE ou Ideo`=="Sous les seuils avec plusieurs SISE"~"Sous les seuils",
      T~`Couverture avec code SISE reconstruit à partir des codes RNCP, MNE ou Ideo`
    ),
    `Couverture avec code SISE retenu`=case_when(
      `Couverture avec code SISE retenu`=="Non couvert avec plusieurs SISE"~"Non couvert",
      `Couverture avec code SISE retenu`=="Sous les seuils avec plusieurs SISE"~"Sous les seuils",
      T~`Couverture avec code SISE retenu`
    )
  ) 