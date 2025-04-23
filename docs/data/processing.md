---
title: Traitements des données
parent: Données et traitements
layout: default
nav_order: 3.3
---

# Traitements des données
{: .no_toc }

*Notre base de données ([Base de données & Indicateurs]({{ site.baseurl }}{% link data/content.md %})) est construire en connectant, recoupant et enrichissant diverses sources, dont les bases InserJeunes, InserSup, les tables de la BCN, etc. ([Jeux de données manipulés]({{ site.baseurl }}{% link data/sources.md %})). Les principaux “traitements” sont décrits ci-dessous.*

## Table des matières
{: .no_toc .text-delta }
- TOC
{:toc}

## Continuum

### De quoi parle-t-on ?
{: .no_toc }

Dans le cadre de la **rénovation du catalogue des formations**, un certain nombre de formations et de diplômes ont été renommés sans changement du contenu de leurs programmes. Ces formations étaient alors considérées comme nouvelles, aucune donnée sur le devenir des apprenants n’a pour l’instant été calculé pour les promotions sortant de ces formations.

**Nous avons pu rétablir le lien qui avait été rompu entre les données recueillies sur une certification avant et après son changement de nom.**

Plus de détails sur la page dédiée de la documentation : [La continuité des données dans le cadre de la rénovation des formations](https://documentation.exposition.inserjeunes.beta.gouv.fr/page/f6e38c4b-0975-40e7-aef5-2e1c41e26450).

### Périmètre
{: .no_toc }

Le continuum est mis en place sur le périmètre InserJeunes, pour les formations en scolaire et en apprentissage.

Cette historisation des formations n’est pas encore mise en place sur le périmètre InserSup.

### Traitement
{: .no_toc }

- La table N_FORMATION_DIPLOME dispose de champs ancien_diplome_1 à 7 et nouveau_diplome_1 à 7([N_FORMATION_DIPLOME]({{ site.baseurl }}{% link data/sources.md %})). Il est donc possible de faire le lien entre une formation ancienne et une formation nouvelle et de propager ce lien au niveau des statistiques (associées à un millésime, une formation et un établissement ou une zone géographique).
- Scripts correspondants (disponibles sur [Github](https://github.com/mission-apprentissage/trajectoires-pro)) :
    - server/src/jobs/bcn/importBCNContinuum.js
        - Construit les liens entre les nouveaux et anciens CFDs
        - Utilise la table “bcn” qui est liée aux données du fichier “N_FORMATION_DIPLOME”
        - Ce script permet de corriger certaines erreurs au niveau du fichier :
            - Certain diplômes sont présent dans "NOUVEAU DIPLOME” mais absent dans “ANCIEN DIPLOME” de la nouvelle formation
            - Certain diplômes sont présent dans "ANCIEN DIPLOME” mais absent dans “NOUVEAU DIPLOME” de l’ancienne formation
    - server/src/jobs/bcn/computeBCNMEFContinuum.js
        - Construit les liens entre les nouveaux et anciens MEF
        - Utilise la table “bcn” (après avoir construit les liens entre nouveaux et anciens CFDs)
        - Utilise la table “bcn_mef” qui est liée aux données du fichier “N_MEF”
        - Traitement :
            - Pour chaque MEF, on récupère les informations du CFD associés
            - Pour chaque ancien/nouveau CFD associé au CFD
                - On récupère le/les MEF
                    - Si il n’existe qu’un seul MEF, on associe le MEF à un ancien/nouveau diplome
                    - Si il existe plusieurs MEF, on garde celui qui a un code “dispositif de formation” identique à celui parent et on associe le MEF à un ancien/nouveau diplome
    - server/src/jobs/stats/computeContinuumStats.js
        - Permet de construire le continuum pour les statistiques de formations.
        - Utilise la table “bcn” (après avoir construit les liens entre nouveaux et anciens CFDs et MEFs)
        - Utilise les tables content les statistiques au niveau national/régional/établissement
        - On utilisera le CFD pour les formations en apprentissage et le MEFSTAT11 pour les formations en voie scolaire
        - On ne créer les associations que pour les cas 1 <> 1. On ignore :
            - Les fusions de diplômes : Plusieurs anciens diplômes pour un seul nouveau
            - Les divisions de diplômes : Plusieurs nouveaux diplômes pour un seul ancien
        - Pour chaque statistique
            - On récupère les anciens/nouveaux diplômes associés à notre code de formation
            - Si il n’y a qu’un seul nouveau diplôme
                - On récupère les informations du nouveau diplôme et on vérifie qu’il est bien associé à un seul ancien diplôme
                - On vérifie que le nouveau diplôme n’a pas de statistique (même code de formation et millésime)
                - On associe les données de notre diplôme à ce nouveau diplôme en ajoutant une information indiquant que les données proviennent d’un ancien diplôme
                    
                    ```
                    "donnee_source": {
                        "code_certification": "40030001", // Code de la formation d'ou proviennent les données
                        "type": "ancienne" // ancienne : indique que les données proviennent de la formation historique
                    },
                    ```
                    
                - On refait la même opération en utilisant le nouveau diplôme pour base
            - Si il n’y a qu’un seul ancien diplôme
                - On récupère les informations de l’ancien diplôme et on vérifie qu’il est bien associé à un seul nouveau diplôme
                - On vérifie que l’ancien diplôme n’a pas de statistique (même code de formation et millésime)
                - On vérifie qu’il n’existe pas une statistique associé à un diplôme plus récent
                - On associe les données de notre diplôme à cet ancien diplôme en ajoutant une information indiquant que les données proviennent d’un nouveau diplôme
                    
                    ```
                    "donnee_source": {
                        "code_certification": "50025431", // Code de la formation d'ou proviennent les données
                        "type": "nouvelle" // nouvelle : indique que les données proviennent de la formation rénovée
                    },
                    ```
                    
                - On refait la même opération en utilisant l’ancien diplôme pour base

### Gains de couverture
{: .no_toc }

Lors de la mise en place initiale du continuum, les gains en termes de couverture sur les formations de l’ensemble des catalogues principaux étaient les suivants :

- **National** :
    - Scolaire : +24 points
    - Apprentissage : +17.6 points
- **Régional** :
    - Scolaire : +23.4 points
    - Apprentissage : +17.5 points
- **Établissement** :
    - Scolaire : +14.5 points
    - Apprentissage : +2.9 points

Voir la page dédiée, [Détails sur l’impact de la continuité des données sur le taux de couverture](https://documentation.exposition.inserjeunes.beta.gouv.fr/page/8010e991-71c8-4cc1-a762-074444343144). Cette étude de couverture a été réalisée avant les travaux sur la gestion des UAI et les familles de métiers.

### Perspectives
{: .no_toc }

Avec la mise à disposition de plus en plus massive des données InserSup, sur la durée, le besoin d’un traitement de type “continuum” pour les données fournies par le SIES va devenir de plus en plus important.

Nous pensons que ce traitement peut se faire en mobilisant les données historisées de Certif-Info (voir [Référentiel national des certifications ]({{ site.baseurl }}{% link data/sources.md %})).

Cette solution a fait l’objet d’un test pour la campagne 2025 de ParcourSup. Voir [Script d’appariement du catalogue Parcoursup]({{ site.baseurl }}{% link offer/script.md %}).

## Familles de métiers et années intermédiaires

### De quoi parle-t-on ?
{: .no_toc }

Les ré-utilisateurs, qui sont souvent des outils d'affectation présentent des premières années dans leurs catalogues. Or les données InserJeunes / InserSup sont fournies au niveau du diplôme. Il est donc nécessaire de relier les différentes années d’une même formation.

Nos travaux permettent donc de **récupérer les indicateurs pour une année intermédiaire** (par exemple une 1ère dans le cadre d’un Bac Pro). Le lien est alors fait avec la dernière année du cursus, qui dispose d’indicateurs sur la poursuite d’études et l’insertion dans l’emploi.

**Dans les cadre de 2des professionnelles communes, au sein de familles de métiers, le lien est fait avec la famille de métiers** (par exemple “Réalisation d'ensembles mécaniques et industriels”) **et l’ensemble des Bac Pro de spécialité**, permettant d’offrir de la visibilité sur le devenir des élèves à partir de l’année d’entrée dans le cursus, celle qui doit faire l’objet d’un vœu d’affectation sur Affelnet notamment. Cette nouvelle information permet d’afficher sur les pages formation des sites d’exposition les indicateurs pour l’ensemble des spécialités disponibles, quand précédemment aucune donnée ne pouvait être présentée, faute de lien 1-1 entre année d’entrée et diplôme.

[En savoir plus sur les familles de métiers en 2de professionnelles (Onisep)](https://www.onisep.fr/formation/apres-la-3-la-voie-professionnelle/les-diplomes-de-la-voie-pro/le-bac-professionnel/les-familles-de-metiers).

### Périmètre
{: .no_toc }

- Pour les liens entre années dans le cas simple, sans première année commune :
    - le lien est fait sur le périmètre DEPP / InserJeunes, en scolaire
    - la question ne pose pas (encore) pour le supérieur ou l'apprentissage, le code SISE / CFD unique par formation.
- Pour les associations multiples dans le cadre de familles de métiers :
    - le lien est disponible pour les familles de métiers en Bac Pro,
    - des problématiques similaires existent sur les BTS mais aucune solution n'a encore été identifiée pour faire ce lien entre première et dernière(s) année(s).
    - des problématiques similaires vont aussi arriver sur le supérieur, par exemple en école d'ingé / commerce (et quand nous aurons une identification plus fine, par exemple avec FRESQ)

### Traitement
{: .no_toc }

- cas simple (années intermédiaires) : à l’aide de la table N_MEF de la BCN [**N_MEF** : modules élémentaires de formation (année dans un dispositif de formation)]({{ site.baseurl }}{% link data/sources.md %}), les statistiques sont associées aux années “non terminales”.
    - Scripts correspondants (disponibles sur [Github](https://github.com/mission-apprentissage/trajectoires-pro)) :
        - server/src/jobs/stats/importAnneesNonTerminales.js
            - Permet d’associer les statistiques des années terminales à leur années intermédiaires
            - Utilise la table “bcn_mef” qui est liée aux données du fichier “N_MEF”
            - On récupère les codes des années précédentes en changeant l’année dans le code MEFSTAT11 (4ème caractère)
            - On associe la statistique de l’année terminale pour chaque codes récupérés
- familles de métiers : à partir des tables de la BCN (notamment N_MEF et tables des familles de métiers, légèrement modifiées).
    - Scripts correspondants (disponibles sur [Github](https://github.com/mission-apprentissage/trajectoires-pro)) :
        - server/src/jobs/bcn/importBCNFamilleMetier.js
            - Permet d’associer dans la table `bcn`, les code de formations à leur famille de métier et d’indiquer si il s’agit d’une seconde commune.
            - Utilise les fichiers :
                - server/data/bcn/n_famille_metier_spec_pro.csv
                    - Basé sur "N_FAMILLE_METIER_SPEC_PRO” auquel est ajouté les familles de métiers manquante avec un code temporaire
                - server/data/bcn/n_lien_mef_famille_metier.csv
                    - Basé sur “N_LIEN_MEF_FAMILLE_METIER”  auquel est ajouté les codes qui ne correspondent pas à des années communes
            - Pour chaque code de formations en voie scolaire (MEFSTAT11)
                - Si il existe dans le fichier “N_LIEN_MEF_FAMILLE_METIER” (on vérifie également si il existe un code pour un ancien/nouveau diplôme en utilisant le continuum)
                    - On associe la formation à sa famille et de métiers et on indique si il s’agit d’une seconde commune
                
        - server/src/jobs/stats/importSecondeCommune.js
            - Permet d’associer une seconde commune aux statistiques de ces années terminales
            - Utilise la table `bcn` après ajout des familles de métiers
            - On effectue le même traitement pour les statistiques nationales/régionales/établissements en ajoutant les filtres nécessaires (région pour le régionales et l’UAI pour les établissements)
            - Pour chaque formations dans notre table `bcn` qui correspond à une année commune
                - On récupère la liste des formations associé à sa famille de métier
                - On ne garde que les formations ou il existe une statistique
                - On ajoute une statistique sans metrics pour notre année commune avec un tableau contenant la liste de formation
                    
                    ```json
                    {
                        "familleMetier": {
                            "code": "CODE FAMILLE DE METIER",
                            "isAnneeCommune": true
                        },
                        "certificationsTerminales": ["CODE ANNEE TERMINALE", "..."]
                    }
                    ```
                    

### Gains de couverture
{: .no_toc }

Concernant les familles de métiers en Bac Pro, …

6279 formations du catalogue d’affectation en ligne Affelnet 2024 appartiennent à une famille de métiers (sur un total de 20010 formations, soit 31.4%)

Sur ces 6279 formations appartenant à une famille de métier, 4842 formations sont désormais potentiellement couvertes (Couvertes ou sous le seuil de 20 élèves), soit 77% des formations appartenant à une famille de métier:

| Formations associées à une famille de métiers | Couverture | Nombre  de formations | Part de formations |
| --- | --- | --- | --- |
| Non | Couvert | 5210 | 38% |
| Non | Non couvert | 4321 | 31% |
| Non | Sous le seuil de 20 élèves | 4200 | 31% |
| Oui | Couvert | 3087 | 49% |
| Oui | Non couvert | 1447 | 23% |
| Oui | Sous le seuil de 20 élèves | 1745 | 28% |

**+15.5 points:** Le taux de couverture passe de 26% (5210 formations couvertes sur 20010) à 41.5% (5210+3087).

Note sur le mode de calcul : l’identification des formations associées à une famille de métiers permet de calculer le taux de couverture de ces formations. Parmi ces formations, certaines sont également appariées via un UAI mère. Dans ces cas, l’appariement résulte donc du rapprochement des UAI et des familles de métiers. 

### Perspectives
{: .no_toc }

- Une solution doit être trouvée pour les BTS disposant d’une première année commune
- Par la suite, et notamment lorsque les données diffusées par InserSup seront disponibles à une maille plus fine, le travail d’association devra être mis en place pour de nouveaux diplômes, notamment en école de commerce ou d’ingénieur.

## Rapprochement des UAI

### De quoi parle-t-on ?
{: .no_toc }

Avant, les indicateurs InserJeunes ne pouvaient être récupérés que pour un unique couple UAI x Code_Certification. 

Cependant, les établissements hébergeant des formations en apprentissage remontent parfois les données à la maille du lieu de formation (UAI Lieu de Formation), du groupe scolaire (UAI Responsable) ou à la maille du formateur (UAI formateur) ce qui pose donc problème.

Grâce à ces travaux de traitement / association, **il est désormais possible de récupérer les indicateurs pour :**

- Un couple UAI lieu de formation x Code_Certification,
- Un couple UAI formateur x Code_Certification,

même lorsque les données du producteur ne sont disponibles qu’à la maille du responsable (UAI responsable). Ce mécanisme est activé uniquement si les données ne sont pas disponibles aux mailles inférieures.

### Périmètre
{: .no_toc }

Ce traitement concerne les formations en apprentissage, sur le périmètre InserJeunes.

### Traitement
{: .no_toc }

- Scripts correspondants (disponibles sur [Github](https://github.com/mission-apprentissage/trajectoires-pro)) :
    - server/src/jobs/stats/computeUAI.js
        - Permet d'identifier le type de l'UAI (lieu de formation, formateur, gestionnaire) des statistiques par établissement
        - Permet d'associer une statistique aux UAIs lieu de formation manquant
        - /!\ Uniquement pour la filière apprentissage
        - Utilise les tables :
            - `catalogueApprentissageFormations`
            - `bcn` pour le continuum
        - Pour chaque statistique :
            - On regarde si l'UAI correspond à un lieu de formation/à un UAI formateur/à un UAI gestionnaire dans le catalogue de l'apprentissage
                - On associe l'UAI à son type (on indique que le type inconnu si il n'existe pas dans le catalogue de l'apprentissage)
                - On ajoute en information les UAIs lieu de formations/formateurs/gestionnaires que l'on récupère (on ajoute que ceux qui ne correspondent au type de base)
            - Après cette première étape, on essaye d'associer les statistiques qui ne correspondent pas à des lieux de formations à leurs lieux de formations
                - Pour chaque statistiques dont l'UAI n'est pas un lieu de formation
                    - On récupère les UAIs lieu de formation
                    - On vérifie qu'il n'existe pas déjà une statistique associé au lieu de formation
                    - On ajoute une statistique pour le lieu de formation en précisant que la donnée provient d'un UAI formateur/gestionnaire
                        ```json
                        {
                            "uai_donnee": "UAI",
                            "uai_donnee_type": "gestionnaire"
                        }
                        ```
                        

### Gains de couverture
{: .no_toc }

#### Affelnet
{: .no_toc }

1503 formations du catalogue d’affectation en ligne Affelnet 2024 sont couvertes par un UAI mère dans Exposition (844 Couvertes et 644 sous le seuil de 20 élèves).

| Comparaison UAI entrée catalogue & UAI Exposition | Couverture | Nombre  de formations | Part de formations |
| --- | --- | --- | --- |
| Différents | Couvert | 844 | 56% |
| Différents | Non couvert | 15 | 1% |
| Différents | Sous le seuil de 20 élèves | 644 | 43% |
| Identiques | Couvert | 7453 | 58% |
| Identiques | Non couvert | 77 | 1% |
| Identiques | Sous le seuil de 20 élèves | 5301 | 41% |
|  | Non couvert | 5676 | 100% |

**+4.5 points:** Le taux de couverture passe de 37% (7453 formations couvertes sur 20010) à 41.5% (7453+844).

#### Parcoursup
{: .no_toc }

2288 formations du catalogue d’affectation en ligne Affelnet 2024 sont couvertes par un UAI mère dans Exposition (1173 Couvertes et 1115 sous le seuil de 20 élèves).

| Comparaison UAI entrée catalogue & UAI Exposition | Couverture | Nombre  de formations | Part de formations |
| --- | --- | --- | --- |
| Différents | Couvert | 1173 | 50% |
| Différents | Non couvert | 73 | 3% |
| Différents | Sous le seuil de 20 élèves | 1115 | 47% |
| Identiques | Couvert | 6074 | 71% |
| Identiques | Non couvert | 694 | 8% |
| Identiques | Sous le seuil de 20 élèves | 1789 | 21% |
|  | Non couvert | 11716 | 100% |

**+5.2 points:** Le taux de couverture passe de 27% (6074 formations couvertes sur 20010) à 32% (6074+1173).

### Perspectives
{: .no_toc }

Intégrer dans l’API, les données de la base ACCE ([ACCE]({{ site.baseurl }}{% link data/sources.md %})) pour faire le lien entre un UAI fille et un UAI mère, de telle sorte que lorsque le producteur diffuse les données à la maille UAI mère, l’API renvoie les indicateurs à la maille UAI fille.

Ici tous les établissements scolaires sont concernés, donc ce traitement pourra impacter directement les formation du SIES et de la DEPP en voie scolaire comme en apprentissage.

Cette solution a fait l’objet d’un test pour la campagne 2025 de ParcourSup. Voir [Script d’appariement du catalogue Parcoursup]({{ site.baseurl }}{% link offer/script.md %})