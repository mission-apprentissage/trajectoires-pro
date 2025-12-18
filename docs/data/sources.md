---
title: Jeux de données manipulés
parent: Données et traitements
layout: default
nav_order: 3.2
---

# Jeux de données manipulés
{: .no_toc }

*Retrouvez ci-dessous la liste des principaux outils et jeux de données manipulés dans le cadre de nos travaux.*

## Table des matières
{: .no_toc .text-delta }
- TOC
{:toc}

## API InserJeunes

L'API InserJeunes permet d'accéder aux [données InserJeunes](https://www.education.gouv.fr/inserjeunes-l-insertion-des-jeunes-apres-une-formation-en-voie-professionnelle-307956) concernant l'insertion des jeunes après une formation en voie professionnelle.

Cette API fournit notamment :

- le taux de poursuite d'études
- le taux d'emploi
- le taux d’autres parcours
- les rémunérations

[Documentation de l’API InserJeunes](https://www.inserjeunes.education.gouv.fr/api/docs/).

### Périmètre
{: .no_toc }

L'API couvre les données relatives à l'apprentissage et au scolaire, du niveau CAP à BTS.

### Périodicité de mise à jour
{: .no_toc }

Les données sont mises à jour trois fois par an.
[Calendrier de diffusion](https://www.education.gouv.fr/inserjeunes-l-insertion-des-jeunes-apres-une-formation-en-voie-professionnelle-307956).

### Format des données
{: .no_toc }

Les données sont disponibles au format JSON.

Les paramètres suivants peuvent être utilisés pour interroger l'API :

- **UAI + millésime** : pour les données spécifiques aux établissements.
- **Filière + millésime** : pour les données nationales.
- **Région + millésime** : pour les données régionales.
- **Département + millésime** : pour les données départementales.
- **Académie + millésime** : pour les données par académies.

### Entité responsable
{: .no_toc }

DEPP - Bureau des études statistiques sur la formation des adultes, l'apprentissage et l'insertion des jeunes

### Utilisation
{: .no_toc }

Donnée de base diffusée via notre API (avec la donnée InserSup).

## API InserSup

L'API InserSup permet d'accéder aux [données InserSup](https://data.enseignementsup-recherche.gouv.fr/explore/dataset/fr-esr-insersup/information/?disjunctive.source&disjunctive.reg_id&disjunctive.aca_id&disjunctive.id_paysage&disjunctive.id_paysage_actuel&disjunctive.etablissement&disjunctive.type_diplome&disjunctive.dom&disjunctive.discipli&disjunctive.sectdis&disjunctive.diplome&disjunctive.date_inser), similaires aux données InserJeunes sur le périmètre du supérieur.

Cette API fournit notamment :

- le taux de poursuite d'études
- le taux d'emploi
- le taux d’autres parcours
- les rémunérations

[API InserSup](https://omogen-api-tst-pr.phm.education.gouv.fr/api_parcoursup) (nécessite un token d’accès, pas de doc).

### Périmètre
{: .no_toc }

Les données couvrent aujourd’hui les licences générales, licences professionnelles, masters, diplômes d’ingénieurs et de management. À terme, l’ensemble des formations du supérieur sera concerné.

### Périodicité de mise à jour
{: .no_toc }

Les données sont mises à jour deux fois par an.

### Format des données
{: .no_toc }

Les données sont disponibles au format JSON.

Aucun paramètre ne doit être fourni en entrée, l’API renvoie toute les données disponibles.

### Entité responsable
{: .no_toc }

SIES - InserSup

### Utilisation
{: .no_toc }

Donnée de base diffusée via notre API (avec la donnée InserJeunes).

## Tables de la BCN

La base centrale des nomenclatures (BCN) contient toutes les nomenclatures en usage dans les applications de gestion et de statistique du ministère en charge du système éducatif. Les tables de la BCN nous permettent de recenser et relier les formation ou diplômes.

### Liste des principales tables utilisées
{: .no_toc }

- **[N_MEF](https://bcn.depp.education.fr/bcn/workspace/viewTable/n/N_MEF)** : modules élémentaires de formation (année dans un dispositif de formation). 
- **[N_FORMATION_DIPLOME](https://bcn.depp.education.fr/bcn/workspace/viewTable/n/N_FORMATION_DIPLOME)** : Diplômes préparés dans les établissements du secondaire (collèges, lycées) et formations intermédiaires.
- **[N_NIVEAU_FORMATION_DIPLOME](https://bcn.depp.education.fr/bcn/workspace/viewTable/n/N_NIVEAU_FORMATION_DIPLOME)** : Niveaux des diplômes et formations intermédiaires dans N_FORMATION_DIPLOME.
- **[N_DIPLOME_SISE](https://bcn.depp.education.fr/bcn/workspace/viewTable/n/N_DIPLOME_SISE)** : Codification des diplômes recensés dans le dispositif SISE (Système d'informations sur le suivi de l'étudiant).
- **[V_FORMATION_DIPLOME](https://bcn.depp.education.fr/bcn/index.php/workspace/viewTable/n/V_FORMATION_DIPLOME/nbElements/20)** : Vue rassemblant les codifications des diplômes susceptibles d'être préparés par la voie d'apprentissage.
- **[N_GROUPE_FORMATION](https://bcn.depp.education.fr/bcn/workspace/viewTable/n/N_GROUPE_FORMATION)** : Listes des groupes de formations utilisés pour les années communes et les formations qui en découlent (ex: familles de métiers dans le cadre des 2des professionnelles communes)
- **[N_LIEN_FORMATION_GROUPE](https://bcn.depp.education.fr/bcn/workspace/viewTable/n/N_LIEN_FORMATION_GROUPE)** : Liens entre les formations et les groupes de formations

### Format des données
{: .no_toc }

Les données sont disponibles au format CSV.

### Entité responsable
{: .no_toc }

DEPP – Bureau des nomenclatures et répertoires

### Utilisation
{: .no_toc }

Les tables sont utilisées pour construire :
- la base de donnée servie par l’API, via divers traitements et recoupements
- le script d’appariement utilisé pour relier les données InserJeunes / InserSup au catalogue Parcoursup

## Fichiers en open data de l’ONISEP

### Idéo-Formations initiales en France

Ce jeu de données comprend **toutes les formations du secondaire au supérieur** référencées par l'Onisep.

[Idéo-Formations initiales en France](https://opendata.onisep.fr/data/5fa591127f501/2-ideo-formations-initiales-en-france.htm?tab=table_65f84591dcff4&id=65f84591dcff4&pluginCode=table&idtf=2&cms_mode=ON_&lheo=0&pid=f0389fae3310c17132b888ea3286c8c397c656a9&from=30)

#### Périmètre
{: .no_toc }

Scolaire, infra et post-bac.

#### Périodicité de mise à jour
{: .no_toc }

Les données sont mises à jour 10 fois par an.

#### Format des données
{: .no_toc }

Les données sont disponibles au format JSON.

#### Entité responsable
{: .no_toc }

Onisep

#### Utilisation
{: .no_toc }

Donnée utilisée pour le script d’appariement permettant de relier les données InserJeunes / InserSup au catalogue Parcoursup.

### Table de passage codes certifications et formations

La table de passage présente exclusivement les **enregistrements actifs** présents dans la base **Certif Info**, et qui sont **liés à au moins une fiche RNCP active ou à un code scolarité de la BCN**.

[Table de passage codes certifications et formations](https://opendata.onisep.fr/data/6152ccdf850ef/2-table-de-passage-codes-certifications-et-formations.htm)

#### Périmètre
{: .no_toc }

Scolaire et apprentissage, infra et post-bac.

#### Périodicité de mise à jour
{: .no_toc }

Les données sont mises à jour 10 fois par an.

#### Format des données
{: .no_toc }

Les données sont disponibles au format JSON.

#### Entité responsable
{: .no_toc }

Onisep

#### Utilisation
{: .no_toc }

Donnée utilisée pour le script d’appariement permettant de relier les données InserJeunes / InserSup au catalogue Parcoursup.

## ACCE

L'application de consultation et cartographie des établissements du système éducatif français (ACCE) est la nouvelle interface de consultation des données de la base centrale des établissements (BCE).

[Application ACCE](https://www.education.gouv.fr/acce/search.php?mode=simple)

### Périmètre
{: .no_toc }

On trouve dans l’ACCE tous les établissements assurant une activité de formation initiale générale, technologique ou professionnelle, de la maternelle à l'enseignement supérieur, qu'ils soient publics ou privés, sous tutelle ou non du ministère de l'éducation nationale, de l'enseignement et de la recherche. Sont également présents les établissements de formation continue de l'éducation nationale, les établissements d'enseignement français à l'étranger et les structures d'administration du système éducatif.

### Format des données
{: .no_toc }

Les données sont disponibles au format CSV depuis [ce lien](https://acce.depp.education.fr/acce/search.php?mode=simple)

### Entité responsable
{: .no_toc }

DEPP - Bureau des études statistiques sur la formation des adultes, l'apprentissage et l'insertion des jeunes

### Utilisation
{: .no_toc }

Donnée utilisée pour le script d’appariement permettant de relier les données InserJeunes / InserSup au catalogue Parcoursup.

## Catalogue de l’apprentissage des ministères éducatifs

Créé pour organiser la collecte des formations en apprentissage, le catalogue des formations en apprentissage permet de rendre plus visibles les offres auprès des jeunes et des employeurs.

[Lien vers le catalogue](https://catalogue.apprentissage.education.gouv.fr/)

### Périmètre
{: .no_toc }

Ensemble de l’offre en apprentissage.

### Format des données
{: .no_toc }

Les données sont disponibles au format CSV.

### Entité responsable
{: .no_toc }

Mission interministérielle pour l’apprentissage.

### Utilisation
{: .no_toc }

Permet de construire la base de donnée servie par l’API, via divers traitements et recoupements.

## Référentiels et API du Réseau des Carif-Oref

### Référentiel national des certifications

Certif Info est un référentiel national de certifications, co-produit par le Réseau des Carif-Oref et l'Onisep. 

[Lien vers le référentiel](https://www.data.gouv.fr/fr/datasets/referentiel-national-des-certifications/)

#### Périmètre
{: .no_toc }

Certif-Info recense l’ensemble des titres et diplômes à finalité professionnelle  délivrés au nom de l’État, les certificats de Qualification Professionnelle élaborés dans le cadre des branches professionnelles, les habilitations, les titres et diplômes élaborés par des organismes de formation publics ou privés accessibles en formation initiale et/ou professionnelle continue.

#### Format des données
{: .no_toc }

Les données sont disponibles au format CSV depuis [ce lien](https://tabular-api.data.gouv.fr/api/resources/f2981d6f-e55c-42cd-8eba-3e891777e222/data/csv/)

#### Entité responsable
{: .no_toc }

Réseau des Carif-Oref

#### Utilisation
{: .no_toc }

Donnée utilisée pour le script d’appariement permettant de relier les données InserJeunes / InserSup au catalogue Parcoursup.

Évolutions suggérées : accès à une base historisée via l'API contenant les champs code CI, CFD, SISE, Formacodes, ROME, Ancien CI, Nouveau CI

### API Certif Info

Cette API permet d'accéder aux données de Certif Info, le référentiel national des certifications.

[Lien vers l'API](https://api-certifinfo.intercariforef.org/docs)

#### Périmètre
{: .no_toc }

Certif-Info recense l’ensemble des titres et diplômes à finalité professionnelle  délivrés au nom de l’État, les certificats de Qualification Professionnelle élaborés dans le cadre des branches professionnelles, les habilitations, les titres et diplômes élaborés par des organismes de formation publics ou privés accessibles en formation initiale et/ou professionnelle continue.

#### Format des données
{: .no_toc }

Les données sont disponibles au format JSON

#### Entité responsable
{: .no_toc }

Réseau des Carif-Oref - [support@intercariforef.org](mailto:support@intercariforef.org)

#### Utilisation
{: .no_toc }

Donnée utilisée pour le script d’appariement permettant de relier les données InserJeunes / InserSup au catalogue Parcoursup.

### API QuiForme

Quiforme est une base de données sur les organismes de formation qui centralise toutes les sources de données pour faire les contrôles règlementaires. 

L’API QuiForme est une API unitaire qui retourne les informations suivantes :

- informations administratives issues de l’Insee
- normalisation des adresses de la BAN
- informations de la liste publique des organismes de formation de la DGEFP
- informations concernant la liste des certifications portées par
l’organisme de formation et ses habilitations déclarées auprès de France compétences (RS et RNCP)

[Lien vers l'API](https://api-quiforme-v2.intercariforef.org/docs)

#### Format des données
{: .no_toc }

Les données sont disponibles au format JSON

#### Périodicité de mise à jour
{: .no_toc }

Quotidienne

#### Entité responsable
{: .no_toc }

Réseau des Carif-Oref - [quiforme@intercariforef.org](mailto:quiforme@intercariforef.org)

#### Utilisation
{: .no_toc }

L’API est utilisée pour préparer les travaux sur l’interface “établissements” de Parcoursup en vue de la campagne 2026.