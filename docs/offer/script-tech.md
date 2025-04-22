---
title: Script, documentation technique
nav_exclude: true
layout: default
---

# Script, documentation technique
{: .no_toc }

- TOC
{:toc}

## FICHIER

[script_appariement_ps.zip]({% link offer/script_appariement_ps.zip %})

## README - Préparation et appariement des Données Parcoursup 2025

### Introduction

Le fichier **ensemble_script_prepa_ps.R** est un script maître permettant de lancer l’ensemble des scripts nécessaires à la préparation des données Parcoursup pour la campagne 2025. Il coordonne l’importation, l’appariement et l’analyse des données afin de générer un catalogue final des formations avec des informations d’insertion professionnelle, de rémunération et de réussite.

### Déroulement du script

#### Chargement des librairies

Avant d'exécuter le script, il est essentiel d'avoir installé et chargé les librairies R requises :

```r
library(tidyverse)
library(readxl)
```

#### Importation et préparation des données (Chronophage)

Le premier script **0_script_prepa_ps_import_data.R** importe et structure les données brutes. Le second script **1_script_prepa_ps_prepa_data.R** recherche l’ensemble des certifications potentielles associées à un code CFD, MEF, SISE, RNCP, IDEO ou Id_RCO (clé des ministères éducatifs).

**Importation des données**

Les données utiles à l’appariement des formations ParcourSup sont essentiellement disponibles sous forme d’API ou via des url d’appels:

- **CertifInfo**: [https://www.data.gouv.fr/fr/datasets/referentiel-national-des-certifications/](https://www.data.gouv.fr/fr/datasets/referentiel-national-des-certifications/),
- **BCN**:
    - n_mef: [https://bcn.depp.education.fr/bcn/workspace/viewTable/n/N_MEF](https://bcn.depp.education.fr/bcn/workspace/viewTable/n/N_MEF),
    - n_formation_diplome: [https://bcn.depp.education.fr/bcn/workspace/viewTable/n/N_FORMATION_DIPLOME](https://bcn.depp.education.fr/bcn/workspace/viewTable/n/N_FORMATION_DIPLOME),
    - n_niveau_formation_diplome: [https://bcn.depp.education.fr/bcn/workspace/viewTable/n/N_NIVEAU_FORMATION_DIPLOME](https://bcn.depp.education.fr/bcn/workspace/viewTable/n/N_NIVEAU_FORMATION_DIPLOME),
    - n_diplome_sise: [https://bcn.depp.education.fr/bcn/workspace/viewTable/n/N_DIPLOME_SISE](https://bcn.depp.education.fr/bcn/workspace/viewTable/n/N_DIPLOME_SISE),
    - v_formation_diplome: [https://bcn.depp.education.fr/bcn/index.php/workspace/viewTable/n/V_FORMATION_DIPLOME/nbElements/20](https://bcn.depp.education.fr/bcn/index.php/workspace/viewTable/n/V_FORMATION_DIPLOME/nbElements/20)
- **Onisep**:
    - Idéo-Formations initiales en France: [https://opendata.onisep.fr/data/5fa591127f501/2-ideo-formations-initiales-en-france.htm?tab=table_65f84591dcff4&id=65f84591dcff4&pluginCode=table&idtf=2&cms_mode=ON_&lheo=0&pid=f0389fae3310c17132b888ea3286c8c397c656a9&from=30](https://opendata.onisep.fr/data/5fa591127f501/2-ideo-formations-initiales-en-france.htm?tab=table_65f84591dcff4&id=65f84591dcff4&pluginCode=table&idtf=2&cms_mode=ON_&lheo=0&pid=f0389fae3310c17132b888ea3286c8c397c656a9&from=30),
    - Table de passage codes certifications et formations: [https://api.opendata.onisep.fr/downloads/6152ccdf850ef/6152ccdf850ef.json](https://api.opendata.onisep.fr/downloads/6152ccdf850ef/6152ccdf850ef.json)

Certaines restent néanmoins à importer et sont stockées dans le dossiers data_utiles avant d’être importées:

- **ACCE**: [https://www.education.gouv.fr/acce/search.php?mode=simple](https://www.education.gouv.fr/acce/search.php?mode=simple),
- **Liste des formations ParcourSup**,
- **Encodages manuels réalisés en 2024 et 2025**,
- **Catégorisation des certifications en scope 2024 / 2025**.

#### API et token

Deux API nécessitent l’utilisation de tokens pour importer les données: Exposition et Certif Info.

- **API Exposition InserJeunes**
    
    L'API est disponible à l'adresse suivante: [https://exposition.inserjeunes.beta.gouv.fr/api/doc/](https://exposition.inserjeunes.beta.gouv.fr/api/doc/) et il faut contacter [contact@inserjeunes.beta.gouv.fr](mailto:contact@inserjeunes.beta.gouv.fr) pour bénéficier d'un token.
    
- **API Certif Info**
    
    L'API est disponible à l'adresse suivante: [https://api-certifinfo.intercariforef.org/docs](https://api-certifinfo.intercariforef.org/docs) et il faut contacter [support@intercariforef.org](mailto:support@intercariforef.org) pour bénéficier d'un token.
    

#### Format minimal des données en entrée

Les tables nécessaires à l’appariement doivent être structurées et contenir des champs utiles à l’exécution du script. Ceux-ci sont détaillés ci-après.

- N_MEF
    
    
    | MEF | MEF_STAT_11 | FORMATION_DIPLOME | DUREE_DISPOSITIF | ANNEE_DISPOSITIF | DATE_OUVERTURE | DATE_FERMETURE |
    | --- | --- | --- | --- | --- | --- | --- |
    | 2543340421 | 25110033404 | 45033404 | 2 | 1 | 01/09/1995 | 31/08/2025 |
    | 2543100121 | 25110031001 | 45031001 | 2 | 1 | 01/09/1993 | 31/08/2022 |
    | 2762121131 | 23811021211 | 40321211 | 3 | 1 | 01/09/2021 | NA |
    | 2762140531 | 23811021405 | 40321405 | 3 | 1 | 01/09/2021 | NA |
    | 2762111431 | 23811021114 | 40321114 | 3 | 1 | 01/09/2021 | NA |
- N_FORMATION_DIPLOME
    
    
    | FORMATION_DIPLOME | NIVEAU_FORMATION_DIPLOME | ANCIEN_DIPLOME_1 | ANCIEN_DIPLOME_2 | ANCIEN_DIPLOME_3 | ANCIEN_DIPLOME_4 | ANCIEN_DIPLOME_5 | ANCIEN_DIPLOME_6 | ANCIEN_DIPLOME_7 | NOUVEAU_DIPLOME_1 | NOUVEAU_DIPLOME_2 | NOUVEAU_DIPLOME_3 | NOUVEAU_DIPLOME_4 | NOUVEAU_DIPLOME_5 | NOUVEAU_DIPLOME_6 | NOUVEAU_DIPLOME_7 | DATE_OUVERTURE |
    | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
    | 99999902 | 999 | NA | NA | NA | NA | NA | NA | NA | NA | NA | NA | NA | NA | NA | NA | 01/09/2021 |
    | 46321218 | 463 | NA | NA | NA | NA | NA | NA | NA | NA | NA | NA | NA | NA | NA | NA | 01/09/2017 |
    | 67010011 | 670 | NA | NA | NA | NA | NA | NA | NA | NA | NA | NA | NA | NA | NA | NA | 01/01/1992 |
    | 26Z13999 | 26Z | NA | NA | NA | NA | NA | NA | NA | NA | NA | NA | NA | NA | NA | NA | 01/09/2019 |
    | 55034499 | 550 | NA | NA | NA | NA | NA | NA | NA | NA | NA | NA | NA | NA | NA | NA | 01/09/1996 |
- N_NIVEAU_FORMATION_DIPLOME
    
    
    | NIVEAU_FORMATION_DIPLOME | NIVEAU_QUALIFICATION_RNCP |
    | --- | --- |
    | 967 | 00 |
    | 966 | 00 |
    | 56S | 03 |
    | 16A | 07 |
    | 265 | 06 |
- N_DIPLOME_SISE
    
    
    | DIPLOME_SISE |
    | --- |
    | 2500248 |
    | S000001 |
    | M000210 |
    | 2500119 |
    | M000113 |
- V_FORMATION_DIPLOME
    
    
    | FORMATION_DIPLOME |
    | --- |
    | 01022001 |
    | 01022102 |
    | 01022103 |
    | 01022104 |
- Données onisep
    - Idéo-Formations initiales en France
        
        
        | code_rncp | url_et_id_onisep |
        | --- | --- |
        | 35627 | [https://www.onisep.fr/http/redirection/formation/slug/FOR.7507](https://www.onisep.fr/http/redirection/formation/slug/FOR.7507) |
        | 35495 | [https://www.onisep.fr/http/redirection/formation/slug/FOR.7835](https://www.onisep.fr/http/redirection/formation/slug/FOR.7835) |
        | NA | [https://www.onisep.fr/http/redirection/formation/slug/FOR.5803](https://www.onisep.fr/http/redirection/formation/slug/FOR.5803) |
        | NA | [https://www.onisep.fr/http/redirection/formation/slug/FOR.1961](https://www.onisep.fr/http/redirection/formation/slug/FOR.1961) |
        | NA | [https://www.onisep.fr/http/redirection/formation/slug/FOR.10781](https://www.onisep.fr/http/redirection/formation/slug/FOR.10781) |
    - Table de passage codes certifications et formations
        
        
        | certif_info_ci_identifiant | ideo_identifiant_formation | ci_code_rncp | ci_code_scolarite |
        | --- | --- | --- | --- |
        | 12650 | FOR.8763 | 37297 | 17021003 |
        | 12754 | FOR.2062 | 37907 | 17020032 |
        | 12846 | FOR.1051 | 38084 | 17023402 |
        | 12953 | FOR.933 | 37370 | NA |
        | 13021 | FOR.1441 | 39028 | 1702550H |
    
- Données CertifInfos
    
    
    | Code_Diplome | codeIdeo2 | Code_RNCP | Code_Scolarité |
    | --- | --- | --- | --- |
    | 1879 | NA | NA | NA |
    | 1880 | FOR.846 | NA | NA |
    | 1896 | FOR.3536 | NA | NA |
    | 1901 | FOR.1118 | NA | NA |
    | 1923 | FOR.589 | NA | NA |
- Données ACCE
    - ACCE_UAI
        
        
        | numero_uai | academie | date_ouverture | date_fermeture |
        | --- | --- | --- | --- |
        | 0010001W | 10 | 01/05/1965 |  |
        | 0010002X | 10 | 01/05/1965 |  |
        | 0010005A | 10 | 01/05/1965 |  |
        | 0010006B | 10 | 01/05/1965 |  |
        | 0010007C | 10 | 01/05/1965 | 31/08/2001 |
    - ACCE_UAI_MERE
        
        
        | numero_uai_trouve | numero_uai_mere |
        | --- | --- |
        | 0010017N | 0010016M |
        | 0010054D | 0010041P |
        | 0010061L | 0019999N |
        | 0010804U | 0690245S |
        | 0010804U | 0381511L |
- Liste des formations ParcourSup
    
    
    | UAI_GES | UAI_COMPOSANTE | LIB_COMPOSANTE | LIB_INS | UAI_AFF | LIB_AFF | ACADÉMIE | CODEFORMATION | LIBFORMATION | CODESPÉCIALITÉ | LIBSPÉCIALITÉ | CODESPÉFORMATIONINITIALE | CODEMEF | CODECFD | CODEFORMATIONINSCRIPTION | CODEFORMATIONACCUEIL | CODESISE | LISTE_IDEO | ID_RCO | FORMATION_PARAMÉTRÉE | APPRENTISSAGEOUSCOLAIRE | LISTE_RNCP | CAPACITE | NBDEDEMANDES |
    | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
    | 0450855K | 0450855K | Université d’Orléans | MI Excellence Minerve - Informatique Mathématiques | 0450855K | Université d’Orléans | Orléans-Tours | 3004 | Licence - Sciences - technologies - santé | 2032 | Portail MI Excellence Minerve - Informatique
    Mathématiques | NA | NA | NA | 47168 | 47168 | NA | FOR.5011 | NA | Paramétrée | Scolaire | NA | 10 | 0 |
    | 0755976N | 0755976N | Université Paris Cité | Expertise linguistique | 0755976N | Université Paris Cité | Paris | 3003 | Licence - Sciences humaines et sociales | 2021 | Sciences du langage - Expertise linguistique | NA | NA | NA | 47194 | 47169 | NA | FOR.10072 | NA | Non Paramétrée | Scolaire | NA | NA | 0 |
    | 0942542C | 0942542C | Antenne de CFA Aston Ecole IT - site d’Arcueil | NA | 0942542C | Antenne de CFA Aston Ecole IT - site d’Arcueil | Créteil | 42 | BTS - Production | 11436 | Cybersécurité, Informatique et réseaux, ELectronique -
    Option A : Informatique et réseaux - en apprentissage | 10436 | 3112011621 | 32020116 | 47102 | 47102 | NA | FOR.8472 | 114654P01214986854940002949868549400029-94003#L01 | Paramétrée | Apprentissage | 35341;37391 | 25 | 17 |
    | 0570309B | 0570309B | IRTS de Lorraine (Ban-Saint-Martin) et CFA du travail
    social | NA | 0570309B | IRTS de Lorraine (Ban-Saint-Martin) et CFA du travail
    social | Nancy-Metz | 640 | BPJEPS | 650032 | Spécialité animateur - Mention Animation sociale - en
    apprentissage | 640032 | NA | NA | 47128 | 47128 | NA | FOR.5221 | NA | Non Paramétrée | Apprentissage | NA | NA | 0 |
    | 0131782S | 0131782S | CFAI Provence | NA | 0131782S | CFAI Provence | Aix-Marseille | 75001 | Diplôme de spécialisation professionnelle | 751111 | DSP - Pilote de lignes de production automatisées - en
    apprentissage | 750111 | NA | NA | 47129 | 47129 | NA | FOR.8616 | 114483P01117829119600005578291196000055-13047#L01 | Non Paramétrée | Apprentissage | 37221 | NA | 2 |
- Encodages manuels réalisés en 2024 et 2025
    
    
    | CODEFORMATIONACCUEIL | code_certification_retenu |
    | --- | --- |
    | 46778 | SISE:2400020 |
    | 46779 | SISE:2400130 |
    | 39151 | SISE:2400008 |
    | 39152 | SISE:2400058 |
    | 39929 | SISE:2400001 |
- Catégorisation des certifications en scope 2024/2025
    
    
    | Type diplôme | Filiere | Scope campagne 2025 |
    | --- | --- | --- |
    | BPJEPS | App. | Oui |
    | BPJEPS | Sco. | Non |
    | CERTIFICAT DE SPÉCIALISATION | App. | Oui |
    | CERTIFICAT DE SPÉCIALISATION | Sco. | Non |
    | CERTIFICAT DE SPÉCIALISATION AGRICOLE | App. | Oui |

**Préparation des données**

Le script a pour objectif de valider et enrichir les codes de
certification présents dans le catalogue Parcoursup (CFD, MEF, SISE,
Ideo, RNCP, Clé des ministères éducatifs), en les reliant à des
référentiels nationaux via API et bases métiers.

4 phases permettent d’aboutir à la création d’une table
(parcoursup_param) dans laquelle, pour chaque formation Parcoursup, on
dispose de toutes les options de correspondances valides par niveau
d’ancienneté (self, ancien, nouveau code) et par nature d’appariement
(normal, inverse).

1. **Initialisation**
    - Chargement des codes CFD, MEF, RNCP, IDEO, SISE, ID_RCO.
    - Transformation en format long.
2. **Construction des correspondances**
    - Pour chaque type de code :
        - Nettoyage (éclatement des codes concaténés)
        - Jointure avec les référentiels (certifinfo, MEF,
        formations…)
        - Enrichissement via API Intercariforef (code SISE, CI
        anciens/nouveaux)
        - Détermination de la validité
3. **Correspondance inverse**
    - CFD → MEF pour certains cas (apprentissage vs scolaire)
    - Génération de MEFSTAT11:xxxx à partir des CFD valides
4. **Fusion finale**
    - Fusion de toutes les correspondances normal/inverse
    - Pivot vers un format exploitable par
    CODEFORMATIONACCUEIL
    - Création de parcoursup_param, table finale enrichie

```json
[
  {
    "CODEFORMATIONACCUEIL":"47168",
    "self":[
      {
        "type_certification":"LISTE_IDEO",
        "validite_code_certification":"Valide",
        "code_ci":"92897","normal":"SISE:2300030",
        "inverse":null
      }
      ],
      "ancien":[
        {
          "type_certification":"LISTE_IDEO",
          "validite_code_certification":"Non valide - Plusieurs codes certification associés",
          "code_ci":null,
          "normal":null,
          "inverse":null
        }
        ],
        "nouveau":{}
  },
  {"CODEFORMATIONACCUEIL":"47169",
  "self":{},
  "ancien":[
    {
      "type_certification":"LISTE_IDEO",
      "validite_code_certification":"Valide",
      "code_ci":"116454",
      "normal":"SISE:2300020",
      "inverse":null
    }
    ],
    "nouveau":{}
  },
  {
    "CODEFORMATIONACCUEIL":"12972",
    "self":[
      {
        "type_certification":"CODESISE",
        "validite_code_certification":"Valide",
        "code_ci":null,
        "normal":"SISE:1002866",
        "inverse":null
      }
      ],
      "ancien":{},
      "nouveau":[
        {
          "type_certification":"LISTE_IDEO",
          "validite_code_certification":"Valide",
          "code_ci":"76522",
          "normal":"SISE:1002866",
          "inverse":null
        }
        ]
  }
  ]
```

**Traitement chronophage: enregistrer une image des données**

> Remarque :
> 
> 
> Ces deux premières étapes peuvent être longues. Pour éviter de les répéter inutilement, une image des données (prepa_ps_2025.RData) est sauvegardée et peut être
> rechargée directement au lieu de relancer l’importation et la préparation des données.
> 
> Les données importées non disponibles via api sont initialement stockées dans le dossier **“data_utiles”**.
> 

**Détail des appels du script pour l’import, la préparation et l’enregistrement des données**

```r
# lancer les scripts d'appariement ----
##1- Imports des données ----
#Ce premier script d'import des données est potentiellement chronophage,
#en fin de script il enregistre une image des données prepa_ps_2025.RData qu'on peut charger plutôt que de relancer systématiquement le premier script.

# Définition du chemin racine pour les données (à adapter selon l'emplacement des fichiers)
chemin_racine_data <- "data_utiles"
choix_api_exposition <- "recette"

### Clés API utiles au moment de l'import des données ----

#### API Exposition InserJeunes ----
# apiKey_ij <- XXXXXXX #clé de l'API Exposition InserJeunes: https://exposition.inserjeunes.beta.gouv.fr/api/doc/

#### API Certif Info ----
# token_ci <- XXXXXXX #clé de l’API Certif Info : https://api-certifinfo.intercariforef.org/docs

urls <- list(
  exposition_ij= list(
    production = "https://exposition.inserjeunes.beta.gouv.fr",
    recette = "https://recette.exposition.inserjeunes.incubateur.net"
  )
)
  

ensemble_key <- readRDS("../data/ensemble_key.rds") #les clés peuvent être stockées dans un fichier si nécéssaire
apiKey_ij <- ensemble_key$apiKey_ij
token_ci <- ensemble_key$token_ci

# source("scripts_appariements/0_script_prepa_ps_import_data.R")

##2- Recherche des codes certification potentiels ----
# source("scripts_appariements/1_script_prepa_ps_prepa_data.R")

# Sauvegarde de l'image des données importées et pré-traitées
# ___________________________________________________________
# !!! Il est fortement conseillé d'enregistrer les données importées et pré-traitées car ces étapes
# sont chronophages.
# ___________________________________________________________
# save.image("prepa_ps_2025.RData")
# rm(list=ls())
# Charger l'image des données predemment importées
load("prepa_ps_2025.RData")
```

### Exécution des Scripts d'appariement

Tous les scripts utilisés sont situés dans le dossier “**scripts_appariements**”.

En dehors des scripts d’import et de préparation des données, le script “ensemble_script_prepa_ps.R” lance les scripts suivants, chacun ayant un rôle spécifique :

| Numéro | Script | Description |
| --- | --- | --- |
| 2-1 | 2_1_script_prepa_ps_focus_insertion.R | Appariement avec les données Insertion d’Exposition |
| 2-2 | 2_2_script_prepa_ps_focus_remuneration.R | Appariement avec les données Rémunération d’Exposition |
| 2-3 | 2_3_script_prepa_ps_focus_passage_reussite.R | Appariement avec les données du SIES (passage et réussite) |
| 3 | 3_script_prepa_ps_agregation_focus.R | Agrégation des données |
| 4 | 4_script_prepa_ps_analyse_couverture.R | Analyse globale de la couverture |

```r
source("sripts_appariements/2_1_script_prepa_ps_focus_insertion.R")
source("sripts_appariements/2_2_script_prepa_ps_focus_remuneration.R")
source("sripts_appariements/2_3_script_prepa_ps_focus_passage_reussite.R")
source("sripts_appariements/3_script_prepa_ps_agregation_focus.R")
source("sripts_appariements/4_script_prepa_ps_analyse_couverture.R")
```

Chaque script d’appariement importe dans un premier temps les données
à apparier.

- **Insertion (Exposition Inserjeunes):**
    
    Formations: [https://exposition.inserjeunes.beta.gouv.fr/api/doc/#/default/get_api_inserjeunes_formations](https://exposition.inserjeunes.beta.gouv.fr/api/doc/#/default/get_api_inserjeunes_formations),
    
    - Formations
        
        
        | code_certification | uai | millesime | code_formation_diplome | uai_type | uai_donnee_type | filiere | niveau_diplome | libelle_type_diplome | nb_annee_term | nb_en_emploi_6_mois | nb_poursuite_etudes | taux_en_emploi_6_mois | taux_autres_6_mois | taux_en_formation |
        | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
        | 23830023303 | 0010001W | 2023 | 40023303 | lieu_formation | lieu_formation | pro | 4 | BAC PRO | 22 | 13 | 5 | 59 | 18 | 23 |
        | 23830023404 | 0010001W | 2023 | 40023404 | lieu_formation | lieu_formation | pro | 4 | BAC PRO | 28 | 4 | 21 | 14 | 11 | 75 |
        | 23830022703 | 0010001W | 2023 | 40022703 | lieu_formation | lieu_formation | pro | 4 | BAC PRO | 24 | 6 | 12 | 25 | 25 | 50 |
        | 23220031122 | 0010001W | 2023 | 50031122 | lieu_formation | lieu_formation | pro | 3 | CAP | 21 | 2 | 13 | 10 | 28 | 62 |
        | 23220031224 | 0010001W | 2023 | 50031224 | lieu_formation | lieu_formation | pro | 3 | CAP | 27 | 6 | 10 | 22 | 41 | 37 |

- **Rémunération (Exposition Inserjeunes):**
    
    Certifications: [https://exposition.inserjeunes.beta.gouv.fr/api/doc/#/default/get_api_inserjeunes_certifications](https://exposition.inserjeunes.beta.gouv.fr/api/doc/#/default/get_api_inserjeunes_certifications).
    
    - Certifications
        
        
        | code_certification | filiere | salaire_12_mois_q1 | salaire_12_mois_q2 | salaire_12_mois_q3 |
        | --- | --- | --- | --- | --- |
        | CFD:01022001 | apprentissage | NA | NA | NA |
        | CFD:01022102 | apprentissage | 1500 | 1620 | 1800 |
        | CFD:01022103 | apprentissage | 1520 | 1660 | 1810 |
        | CFD:01022104 | apprentissage | 1480 | 1620 | 1770 |
        | CFD:01022105 | apprentissage | 1600 | 1710 | 1870 |
- **Données de réussite et passage du SIES**,
    - Données de réussite et passage du SIES
        - UAI principale
            
            
            | uai principal | diplom | taux_de_reussite_19 | taux_de_passage_22 |
            | --- | --- | --- | --- |
            | 0062205P | 2300014 | 37.6 | 53.5 |
            | 0062205P | 2300032 | ns | NA |
            | 0062205P | 2300036 | 39.8 | 32 |
            | 0062205P | 2300061 | 43.4 | 41.8 |
            | 0062205P | 2300065 | ns | ns |
        - UAI composante
            
            
            | uai composante | diplom | taux_de_reussite_19 | taux_de_passage_22 |
            | --- | --- | --- | --- |
            | 0011310U | 2300002 | 59.8 | 45.9 |
            | 0011311V | 2300004 | 56.5 | 32.1 |
            | 0011329P | 2300010 | 38.9 | 39.4 |
            | 0020087J | 2300135 | 45.5 | NA |
            | 0022049S | 2300194 | 28.8 | 25.2 |

### Format des données en sortie

#### Table utile en sortie du script de préparation des données (1_script_prepa_ps_prepa_data.R)

Le script associe à chaque formation du catalogue Parcoursup initial tous les codes certifications possibles en fonction des codes formations en entrée (CFD, MEF, SISE, Idéo, RNCP, id_RCO). Ainsi pour une ligne du catalogue initial ppeuvent être associées plusieurs lignes en sortie.

Cette table contient l’ensemble des champs du catalogue initial et 6 nouveaux champs:

- **type_certification**: Renvoie le champs initial
utilisé pour la recherche de nouveau code certification. Il prend une
des valeurs suivantes:
    - CODECFD,
    - CODEMEF,
    - CODESISE,
    - ID_RCO,
    - LISTE_RNCP,
    - LISTE_IDEO.
- **code_certification**: Renvoie la valeur du champs initial utilisé pour la recherche de nouveau code certification,
- **validite_code_certification**: Renvoie une valeur parmi :
    - Valide: un unique code certification possible (code_certification_possible) est associé au code certification initial (code_certification),
    - Non valide - Plusieurs codes certification associés: plusieurs codes certifications possibles (code_certification_possible) sont associés au code certification initial (code_certification),,
    - Non valide - Code inconnu: aucun code certification possible (code_certification_possible) n’est associé au code certification initial (code_certification),
    - NA: il n’y a pas de code certification initial (code_certification).
- **anciennete_certification_ci:** Renvoie une valeur parmi :
    - self: le code certification possible est directement associé au code certification initial (code_certification),
    - ancien: le code certification possible est associé au code certification initial (code_certification) par un ancien code certification,
    - nouveau: le code certification possible est associé au code certification initial (code_certification) par un nouveau code certification,
    - NA: il n’y a pas de code certification initial (code_certification).
- **appariement:** Dans le cas de formation mixte (voie scolaire et apprentissage), inserjeunes agrège parfois les données dans une seule voie. Les données de l’apprentissage sont associées aux données d’insertion de la voie scolaire et ne sont renseignée que pour la voie scolaire (qui est donc l’agrégation des 2 voies). La réciproque est égaelement vraie. Le script propose donc parmi les codes possibles, les codes correspondant à la voie scolaire pour l’apprentissage (mefstat11) et reciproquement pour la scolaire (CFD). Le champ renvoie une valeur parmi :
    - normal: le code certification possible est directement associé au code certification initial (code_certification),
    - inverse: le code certification possible est inversement associé au code certification initial (code_certification): CFD pour la voie scolaire et MEFSTAT11 pour le voie apprentissage,
    - NA: il n’y a pas de code certification initial (code_certification).
- code_certification_possible: Renvoie un code valide (existant dans la BCN) pouvant directement être appelé sur l’API inserjeunes. Son format est soit:
    - CFD:XXXXXXXX
    - MEFSTAT11:XXXXXXXXXXX
    - SISE:XXXXXX

| UAI_GES | UAI_COMPOSANTE | LIB_COMPOSANTE | LIB_INS | UAI_AFF | LIB_AFF | ACADÉMIE | CODEFORMATION | LIBFORMATION | CODESPÉCIALITÉ | LIBSPÉCIALITÉ | CODESPÉFORMATIONINITIALE | CODEMEF | CODECFD | CODEFORMATIONINSCRIPTION | CODEFORMATIONACCUEIL | CODESISE | LISTE_IDEO | ID_RCO | FORMATION_PARAMÉTRÉE | APPRENTISSAGEOUSCOLAIRE | LISTE_RNCP | CAPACITE | NBDEDEMANDES | type_certification | code_certification | validite_code_certification | anciennete_certification_ci | appariement | code_certification_possible |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0450855K | 0450855K | Université d’Orléans | MI Excellence Minerve - Informatique Mathématiques | 0450855K | Université d’Orléans | Orléans-Tours | 3004 | Licence - Sciences - technologies - santé | 2032 | Portail MI Excellence Minerve - Informatique
Mathématiques | NA | NA | NA | 47168 | 47168 | NA | FOR.5011 | NA | Paramétrée | Scolaire | NA | 10 | 0 | LISTE_IDEO | FOR.5011 | Valide | self | normal | SISE:2300030 |
| 0450855K | 0450855K | Université d’Orléans | MI Excellence Minerve - Informatique Mathématiques | 0450855K | Université d’Orléans | Orléans-Tours | 3004 | Licence - Sciences - technologies - santé | 2032 | Portail MI Excellence Minerve - Informatique
Mathématiques | NA | NA | NA | 47168 | 47168 | NA | FOR.5011 | NA | Paramétrée | Scolaire | NA | 10 | 0 | LISTE_IDEO | FOR.5011 | Non valide - Plusieurs codes certification
associés | ancien | normal | SISE:2100010 |
| 0450855K | 0450855K | Université d’Orléans | MI Excellence Minerve - Informatique Mathématiques | 0450855K | Université d’Orléans | Orléans-Tours | 3004 | Licence - Sciences - technologies - santé | 2032 | Portail MI Excellence Minerve - Informatique
Mathématiques | NA | NA | NA | 47168 | 47168 | NA | FOR.5011 | NA | Paramétrée | Scolaire | NA | 10 | 0 | LISTE_IDEO | FOR.5011 | Non valide - Plusieurs codes certification
associés | ancien | normal | SISE:2100871 |
| 0450855K | 0450855K | Université d’Orléans | MI Excellence Minerve - Informatique Mathématiques | 0450855K | Université d’Orléans | Orléans-Tours | 3004 | Licence - Sciences - technologies - santé | 2032 | Portail MI Excellence Minerve - Informatique
Mathématiques | NA | NA | NA | 47168 | 47168 | NA | FOR.5011 | NA | Paramétrée | Scolaire | NA | 10 | 0 | LISTE_IDEO | FOR.5011 | Non valide - Plusieurs codes certification
associés | ancien | normal | SISE:2100927 |
| 0450855K | 0450855K | Université d’Orléans | MI Excellence Minerve - Informatique Mathématiques | 0450855K | Université d’Orléans | Orléans-Tours | 3004 | Licence - Sciences - technologies - santé | 2032 | Portail MI Excellence Minerve - Informatique
Mathématiques | NA | NA | NA | 47168 | 47168 | NA | FOR.5011 | NA | Paramétrée | Scolaire | NA | 10 | 0 | LISTE_IDEO | FOR.5011 | Non valide - Plusieurs codes certification
associés | ancien | normal | SISE:2101391 |

#### Table en sortie des scripts d’appariement avec les données à exposer

Les script d’appariement avec les données à exposer renvoie systématiquement une table contenant les champs suivants : 

- CODEFORMATIONACCUEIL,
- code_certification_retenu: code_certification_insertion, code_certification_salaire ou code_certification_sies lorsque la formation est couverte,
- Les champs liés aux statistiques à afficher : (taux_en_emploi_6_mois, taux_en_formation et taux_autres_6_mois) pour l’insertion, (salaire_12_mois_q1,salaire_12_mois_q2 et salaire_12_mois_q3) pour la rémunération ou (taux_de_reussite_19 et taux_de_passage_22) pour les données du sies,
- Couverture_insertion: explication de non couverture.

- Insertion d’Expositions (2_1_script_prepa_ps_focus_insertion.R)
    
    
    | CODEFORMATIONACCUEIL | code_certification_insertion | taux_en_emploi_6_mois | taux_en_formation | taux_autres_6_mois | Couverture_insertion |
    | --- | --- | --- | --- | --- | --- |
    | 12621 | SISE:2300047 | 3 | 70 | 27 | Couvert |
    | 3268 | NA | NA | NA | NA | Non couvert - UAI Inconnu |
    | 5318 | MEFSTAT11:32211031212 | 24 | 60 | 16 | Couvert |
    | 24078 | NA | NA | NA | NA | Non couvert - Nouvelle formation |
    | 6503 | SISE:2300027 | 10 | 79 | 11 | Couvert |
- Rémunération d’Expositions (2_2_script_prepa_ps_focus_remuneration.R)
    
    
    | CODEFORMATIONACCUEIL | code_certification_salaire | salaire_12_mois_q1 | salaire_12_mois_q2 | salaire_12_mois_q3 | couverture_salaire |
    | --- | --- | --- | --- | --- | --- |
    | 47168 | SISE:2300030 | 1560 | 1790 | 2030 | Couvert |
    | 47169 | SISE:2300020 | 1340 | 1430 | 1720 | Couvert |
    | 47102 | CFD:32020116 | 1550 | 1680 | 1900 | Couvert |
    | 47082 | CFD:32023012 | 1560 | 1800 | 2090 | Couvert |
    | 47103 | CFD:32031312 | 1510 | 1690 | 1890 | Couvert |
- Données du SIES (passage et réussite (2_3_script_prepa_ps_focus_passage_reussite.R)
    
    
    | CODEFORMATIONACCUEIL | code_certification_sies | taux_de_reussite_19 | taux_de_passage_22 | Couverture_sies |
    | --- | --- | --- | --- | --- |
    | 8731 | NA | NA | NA | Non couvert - Sans raison évidente |
    | 28302 | NA | NA | NA | Non couvert - Sans raison évidente |
    | 33838 | NA | NA | NA | Non couvert - Sans raison évidente |
    | 9285 | SISE:2300026 | 50.3 | 50.9 | Couvert |
    | 17209 | SISE:2300027 | 39.8 | 33 | Couvert |

#### Table en sortie du script d’agrégation des données (3_script_prepa_ps_agregation_focus.R)

Le script d’agrégation des données renvoie la table initiale parcoursup à laquelle on renseigne les données d’insertion, de rémunération et les taux de passage.

#### Table en sortie du script d’analyse globale de la couverture (4_script_prepa_ps_analyse_couverture.R)

Ce script permet d’avoir une synthèse de la couverture des données d’Inserjeunes à 3 niveaux:

- Périmètre des formations (le scope),
- Type de diplôme,
- Périmètre des formation et moment de l’appariement (sans api Inserjeunes, avec API Inserjeunes et avec les efforts d’appariement).

- Synthèse de couverture en fonction du périmètre des formations (stats_catalogue_parcoursup_couverture_synthese)
    
    
    | Scope campagne 2025 | Couvert (nb) | Couvert (%) | Non couvert (nb) | Non couvert (%) | Non couvert - Sous le seuil de 20 élèves (nb) | Non couvert - Sous le seuil de 20 élèves (%) | Non couvert - Nouvelle formation (nb) | Non couvert - Nouvelle formation (%) | Non couvert - code certification inconnu (nb) | Non couvert - code certification inconnu (%) | Non couvert - UAI Inconnu (nb) | Non couvert - UAI Inconnu (%) | Non couvert - Territoire mal couvert (nb) | Non couvert - Territoire mal couvert (%) | Non couvert - Plusieurs formations en annéee terminale
    associées (nb) | Non couvert - Plusieurs formations en annéee terminale
    associées (%) | Non couvert - Plusieurs certifications associées au
    départ dont une seule est couverte (nb) | Non couvert - Plusieurs certifications associées au
    départ dont une seule est couverte (%) | Non couvert - Sans raison évidente (nb) | Non couvert - Sans raison évidente (%) |
    | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
    | Non | 43 | 0.0142478 | 2975 | 0.9857522 | 75 | 0.0248509 | 110 | 0.0364480 | 593 | 0.1964877 | 319 | 0.1056991 | 16 | 0.0053015 | 15 | 0.0049702 | 0 | 0.0000000 | 1564 | 0.5182240 |
    | Oui | 9896 | 0.5376508 | 8510 | 0.4623492 | 2842 | 0.1544062 | 136 | 0.0073889 | 44 | 0.0023905 | 760 | 0.0412909 | 60 | 0.0032598 | 1 | 0.0000543 | 18 | 0.0009779 | 4415 | 0.2398674 |
- Synthèse de couverture en fonction du type de diplôme des formations (stats_catalogue_parcoursup_couverture)
    
    
    | Type diplôme | Filiere | Scope campagne 2025 | Couvert (nb) | Couvert (%) | Non couvert (nb) | Non couvert (%) | Non couvert - Sous le seuil de 20 élèves (nb) | Non couvert - Sous le seuil de 20 élèves (%) | Non couvert - Nouvelle formation (nb) | Non couvert - Nouvelle formation (%) | Non couvert - code certification inconnu (nb) | Non couvert - code certification inconnu (%) | Non couvert - UAI Inconnu (nb) | Non couvert - UAI Inconnu (%) | Non couvert - Territoire mal couvert (nb) | Non couvert - Territoire mal couvert (%) | Non couvert - Plusieurs formations en annéee terminale
    associées (nb) | Non couvert - Plusieurs formations en annéee terminale
    associées (%) | Non couvert - Plusieurs certifications associées au
    départ dont une seule est couverte (nb) | Non couvert - Plusieurs certifications associées au
    départ dont une seule est couverte (%) | Non couvert - Sans raison évidente (nb) | Non couvert - Sans raison évidente (%) |
    | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
    | BPJEPS | Sco. | Non | 0 | 0.0000000 | 68 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 67 | 0.9852941 | 1 | 0.0147059 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 |
    | BREVET DE MAÎTRISE | App. | Non | 0 | 0.0000000 | 1 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 1 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 |
    | BTS - AGRICOLE | App. | Oui | 121 | 0.2104348 | 454 | 0.7895652 | 100 | 0.1739130 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 354 | 0.6156522 |
    | BTS - AGRICOLE | Sco. | Oui | 19 | 0.0365385 | 501 | 0.9634615 | 43 | 0.0826923 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 2 | 0.0038462 | 0 | 0.0000000 | 0 | 0.0000000 | 456 | 0.8769231 |
    | BTS - MARITIME | Sco. | Non | 0 | 0.0000000 | 19 | 1.0000000 | 0 | 0.0000000 | 5 | 0.2631579 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 14 | 0.7368421 |
    | BTS - PRODUCTION | App. | Oui | 889 | 0.4671571 | 1014 | 0.5328429 | 688 | 0.3615344 | 9 | 0.0047294 | 0 | 0.0000000 | 10 | 0.0052549 | 3 | 0.0015765 | 0 | 0.0000000 | 5 | 0.0026274 | 299 | 0.1571203 |
    | BTS - PRODUCTION | Sco. | Oui | 1170 | 0.6927176 | 519 | 0.3072824 | 379 | 0.2243931 | 6 | 0.0035524 | 0 | 0.0000000 | 0 | 0.0000000 | 10 | 0.0059207 | 0 | 0.0000000 | 0 | 0.0000000 | 124 | 0.0734162 |
    | BTS - SERVICES | App. | Oui | 2045 | 0.3672113 | 3524 | 0.6327887 | 1085 | 0.1948285 | 0 | 0.0000000 | 0 | 0.0000000 | 187 | 0.0335787 | 3 | 0.0005387 | 0 | 0.0000000 | 1 | 0.0001796 | 2248 | 0.4036631 |
    | BTS - SERVICES | Sco. | Oui | 2372 | 0.7751634 | 688 | 0.2248366 | 337 | 0.1101307 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 39 | 0.0127451 | 0 | 0.0000000 | 11 | 0.0035948 | 277 | 0.0905229 |
    | CERTIFICAT DE SPÉCIALISATION | App. | Oui | 54 | 0.1747573 | 255 | 0.8252427 | 116 | 0.3754045 | 34 | 0.1100324 | 0 | 0.0000000 | 1 | 0.0032362 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 103 | 0.3333333 |
    | CERTIFICAT DE SPÉCIALISATION | Sco. | Non | 33 | 0.0962099 | 310 | 0.9037901 | 71 | 0.2069971 | 82 | 0.2390671 | 0 | 0.0000000 | 0 | 0.0000000 | 7 | 0.0204082 | 0 | 0.0000000 | 0 | 0.0000000 | 142 | 0.4139942 |
    | CERTIFICAT DE SPÉCIALISATION AGRICOLE | App. | Oui | 45 | 0.2000000 | 180 | 0.8000000 | 51 | 0.2266667 | 87 | 0.3866667 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 42 | 0.1866667 |
    | CPES | Sco. | Non | 0 | 0.0000000 | 25 | 1.0000000 | 0 | 0.0000000 | 23 | 0.9200000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 2 | 0.0800000 |
    | CUPGE - ARTS LETTRES LANGUES | Sco. | Non | 1 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 |
    | CUPGE - DROIT-ÉCONOMIE-GESTION | Sco. | Non | 0 | 0.0000000 | 3 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 2 | 0.6666667 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 1 | 0.3333333 |
    | CUPGE - SCIENCES, TECHNOLOGIE, SANTÉ | Sco. | Non | 5 | 0.2173913 | 18 | 0.7826087 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 2 | 0.0869565 | 1 | 0.0434783 | 0 | 0.0000000 | 0 | 0.0000000 | 3 | 0.1304348 |
    | D.E SECTEUR SANITAIRE | App. | Non | 0 | 0.0000000 | 4 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 4 | 1.0000000 |
    | D.E SECTEUR SANITAIRE | Sco. | Non | 0 | 0.0000000 | 515 | 1.0000000 | 3 | 0.0058252 | 0 | 0.0000000 | 0 | 0.0000000 | 220 | 0.4271845 | 1 | 0.0019417 | 11 | 0.0213592 | 0 | 0.0000000 | 280 | 0.5436893 |
    | D.E SECTEUR SOCIAL | App. | Non | 0 | 0.0000000 | 194 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 3 | 0.0154639 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 191 | 0.9845361 |
    | D.E SECTEUR SOCIAL | Sco. | Non | 0 | 0.0000000 | 239 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 3 | 0.0125523 | 2 | 0.0083682 | 0 | 0.0000000 | 0 | 0.0000000 | 234 | 0.9790795 |
    | DE SPECTACLE VIVANT | Sco. | Non | 0 | 0.0000000 | 9 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 9 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 |
    | DEJEPS | Sco. | Non | 0 | 0.0000000 | 1 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 1 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 |
    | DEUST | App. | Non | 0 | 0.0000000 | 93 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 86 | 0.9247312 | 2 | 0.0215054 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 5 | 0.0537634 |
    | DEUST | Sco. | Non | 0 | 0.0000000 | 58 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 10 | 0.1724138 | 5 | 0.0862069 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 43 | 0.7413793 |
    | DIPLÔME D’ETABLISSEMENT | App. | Non | 0 | 0.0000000 | 1 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 1 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 |
    | DIPLÔME D’ETABLISSEMENT | Sco. | Non | 0 | 0.0000000 | 39 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 1 | 0.0256410 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 1 | 0.0256410 |
    | DIPLÔME D’UNIVERSITÉ | Sco. | Non | 1 | 0.0232558 | 42 | 0.9767442 | 0 | 0.0000000 | 0 | 0.0000000 | 12 | 0.2790698 | 2 | 0.0465116 | 2 | 0.0465116 | 0 | 0.0000000 | 0 | 0.0000000 | 19 | 0.4418605 |
    | DIPLÔME D’ÉTABLISSEMENT | Sco. | Non | 0 | 0.0000000 | 1 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 |
    | DIPLÔME DE SPÉCIALISATION PROFESSIONNELLE | App. | Oui | 0 | 0.0000000 | 9 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 5 | 0.5555556 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 4 | 0.4444444 |
    | DIPLÔME DE SPÉCIALISATION PROFESSIONNELLE | Sco. | Non | 0 | 0.0000000 | 7 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 5 | 0.7142857 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 2 | 0.2857143 |
    | DIPLÔME NATIONAL D’ART | Sco. | Non | 0 | 0.0000000 | 52 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 10 | 0.1923077 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 1 | 0.0192308 |
    | DMA | App. | Non | 0 | 0.0000000 | 1 | 1.0000000 | 1 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 |
    | DN MADE | App. | Non | 0 | 0.0000000 | 9 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 9 | 1.0000000 |
    | DN MADE | Sco. | Non | 0 | 0.0000000 | 320 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 2 | 0.0062500 | 0 | 0.0000000 | 0 | 0.0000000 | 318 | 0.9937500 |
    | DNSP SPECTACLE VIVANT | Sco. | Non | 0 | 0.0000000 | 13 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 11 | 0.8461538 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 2 | 0.1538462 |
    | FCIL | Sco. | Non | 0 | 0.0000000 | 121 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 11 | 0.0909091 | 0 | 0.0000000 | 1 | 0.0082645 | 0 | 0.0000000 | 0 | 0.0000000 | 105 | 0.8677686 |
    | FORMATION DES ÉCOLES DE COMMERCE ET DE MANAGEMENT | Sco. | Oui | 0 | 0.0000000 | 49 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 29 | 0.5918367 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 1 | 0.0204082 |
    | FORMATION DES ÉCOLES DE COMMERCE ET DE MANAGEMENT BAC +
    3 | App. | Non | 0 | 0.0000000 | 5 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 1 | 0.2000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 4 | 0.8000000 |
    | FORMATION DES ÉCOLES DE COMMERCE ET DE MANAGEMENT BAC +
    3 | Sco. | Non | 0 | 0.0000000 | 133 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 44 | 0.3308271 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 6 | 0.0451128 |
    | FORMATION DES ÉCOLES DE COMMERCE ET DE MANAGEMENT BAC +
    5 | Sco. | Oui | 60 | 0.9090909 | 6 | 0.0909091 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 2 | 0.0303030 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 |
    | FORMATION DES ÉCOLES SUPÉRIEURES D’ART | Sco. | Non | 0 | 0.0000000 | 36 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 |
    | FORMATION DES ÉCOLES SUPÉRIEURES DE CUISINE | Sco. | Non | 0 | 0.0000000 | 15 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 |
    | FORMATION PROFESSIONNELLE | App. | Non | 0 | 0.0000000 | 559 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 375 | 0.6708408 | 24 | 0.0429338 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 160 | 0.2862254 |
    | FORMATION PROFESSIONNELLE | Sco. | Non | 0 | 0.0000000 | 1 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 1 | 1.0000000 |
    | FORMATION VALANT GRADE DE LICENCE | Sco. | Non | 0 | 0.0000000 | 10 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 10 | 1.0000000 |
    | FORMATIONS DES ÉCOLES D’INGÉNIEURS | App. | Non | 0 | 0.0000000 | 4 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 4 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 |
    | FORMATIONS DES ÉCOLES D’INGÉNIEURS | Sco. | Oui | 160 | 0.2753873 | 421 | 0.7246127 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 349 | 0.6006885 | 1 | 0.0017212 | 0 | 0.0000000 | 0 | 0.0000000 | 6 | 0.0103270 |
    | FORMATIONS BAC + 3 | Sco. | Non | 0 | 0.0000000 | 1 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 1 | 1.0000000 |
    | FORMATIONS BAC + 5 | Sco. | Non | 0 | 0.0000000 | 42 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 2 | 0.0476190 | 1 | 0.0238095 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 |
    | LICENCE GÉNÉRALE | App. | Non | 0 | 0.0000000 | 6 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 6 | 1.0000000 |
    | LICENCE GÉNÉRALE | Sco. | Oui | 2946 | 0.7699948 | 880 | 0.2300052 | 43 | 0.0112389 | 0 | 0.0000000 | 39 | 0.0101934 | 182 | 0.0475693 | 2 | 0.0005227 | 1 | 0.0002614 | 1 | 0.0002614 | 497 | 0.1299007 |
    | LICENCE PROFESSIONNELLE | App. | Non | 3 | 1.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 |
    | LICENCE PROFESSIONNELLE | Sco. | Oui | 15 | 0.6000000 | 10 | 0.4000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 0 | 0.0000000 | 4 | 0.1600000 |
- En fonction du périmètre des formation et du moment de l’appariement (sans api Inserjeunes, avec API Inserjeunes et avec les efforts d’appariement : stats_parcoursup_catalogue_Couverture_insertion_avant_MIJ_synthese )
    
    
    | Scope campagne 2025 | Nombre de formations | Part du catalogue | Couvert initialement (nb) | Couvert initialement (%) | Couvert par api (nb) | Couvert par api (%) | Couvert (nb) | Couvert (%) | Impact api (nb) | Impact api (Pts) | Impact appariement (nb) | Impact appariement (Pts) | Impact Global (nb) | Impact Global (Pts) |
    | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
    | Non | 3018 | 0.1408701 | 10 | 0.0033135 | 41 | 0.0135852 | 43 | 0.0142478 | 31 | 0.0102717 | 2 | 0.0006627 | 33 | 0.0109344 |
    | Oui | 18406 | 0.8591299 | 5277 | 0.2867000 | 7314 | 0.3973704 | 9896 | 0.5376508 | 2037 | 0.1106704 | 2582 | 0.1402803 | 4619 | 0.2509508 |