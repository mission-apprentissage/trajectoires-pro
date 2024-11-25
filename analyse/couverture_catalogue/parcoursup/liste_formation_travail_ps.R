parcoursup_2024_renseigne_pas_ij_pas_isup_et_ij %>% 
  filter(Couverture == "Non couvert") %>% 
  filter(!Nouvelle_formation) %>% 
  filter(type_territoire=="Territoire normalement couvert") %>% 
  select(CODEFORMATIONACCUEIL,type_uai,presence_UAI_ACCE,presence_Code_Scolarité_certif_info) %>% 
  mutate(
    commentaire=case_when(
      presence_UAI_ACCE & presence_Code_Scolarité_certif_info~"Ok PS",
      presence_UAI_ACCE ~"Attention code formation",
      presence_Code_Scolarité_certif_info ~"Attention code uai",
      T~"Attention code formation & uai"
    )
  ) %>% 
  filter(commentaire!="Ok PS") %>% 
  distinct(CODEFORMATIONACCUEIL,commentaire) %>% 
  bind_rows(
    parcoursup_campagne_2024_sup_a_transmettre_PS %>% 
      filter(!`Couverture avec code SISE retenu` %in% c("Couvert","Sous les seuils")) %>% 
      anti_join(
        n_diplome_sise %>% 
          distinct(DIPLOME_SISE),
        by=c("Code SISE retenu"="DIPLOME_SISE")
      ) %>% 
      mutate(commentaire="Attention code formation") %>% 
      distinct(CODEFORMATIONACCUEIL,commentaire)
      ) %>% 
  left_join(
    parcoursup_campagne_2024,
    by="CODEFORMATIONACCUEIL"
  ) %>% 
  mutate(
    `Type diplôme`=case_when(
      str_sub(LIBFORMATION,1,2)=="LP"~"Licence professionnelle",
      str_sub(LIBFORMATION,1,7)=="Licence"~"Licence générale",
      T~LIBFORMATION
    )
  ) %>% 
  left_join(
    correspondance_formation_certificateur %>% 
      mutate(Filiere=ifelse(Filiere=="Sco.","Scolaire","Apprentissage")),
    by=c("Type diplôme","APPRENTISSAGEOUSCOLAIRE"="Filiere")
  ) %>% 
  filter(`Scope campagne 2025`=="Oui") %>% 
  clipr::write_clip()