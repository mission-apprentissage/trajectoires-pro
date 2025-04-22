---
title: Script d’appariement du catalogue Parcoursup
parent: Les outils mis à disposition
layout: default
nav_order: 4.4
---

# Script d’appariement du catalogue Parcoursup

## Problématique et objectifs

Le catalogue Parcoursup ne permet pas d’identifier correctement les formations du supérieur présentes dans la base InserSup. En effet, bien qu’il contienne un champ SISE, renseigné par les établissements, celui-ci est souvent absent ou inexact.

L’association entre le catalogue Parcoursup et les données InserJeunes / InserSup est donc partiel.

Pour répondre à ce problème, des travaux ont été entrepris pour exploiter les données disponibles (SISE parfois, RNCP, Ideo, intitulés, etc.) afin de consolider le catalogue Parcoursup en lui associant des identifiants “formation” (CFD, MEFSTAT11 ou SISE) de qualité.

## Script

L’appariement est réalisé en deux temps :

- Associer un code certification (CFD, MEFSTAT11 ou SISE) à un maximum de formations du catalogue ParcourSup,
- Ajouter les données d’**insertion** et de **rémunération** (Exposition), ainsi que les **taux de passage / réussite** (SIES).

Le contenu du script d’appariement, en langage R, est disponible dans : 

[Script]({% link offer/script-tech.md %})

ainsi que la description des différentes étapes.

## Perspectives pour la suite

Le catalogue Parcoursup doit être consolidé au plus vite, pour gommer en grande partie le problème d’appariement. En attendant, puis éventuellement en complément, le script doit être maintenu.

Voir ce [document](https://docs.google.com/presentation/d/1ieePAfL0mq5mMmDoaoDsUzJk5WAAzMziZMPIySgLB6g/edit?usp=sharing).

### Consolidation des SISE côté PS

#### Quoi ?

Aider les établissements qui alimentent le catalogue Parcoursup à renseigner des codes formation corrects, notamment des codes SISE. L’appariement sera alors plus simple et complet.

#### Comment ? (proposition)

- L’API “Qui forme ?” permet, pour un organisme de formation donné de récupérer la liste des certifications portées et les habilitations déclarées auprès de France compétences. Voir [API QuiForme]({% link data/sources.md %})
- L’interface “établissement” côté PS permet de sélectionner un établissement, puis une certification dans cette base, plutôt que de renseigner un code SISE (champ libre). Les identifiants, dont le SISE, sont stockés par PS en vue de l’appariement.

Prototype : 

Test d’un formulaire identifiant les certifications possibles à partir d’un UAI ou d’un libellé

L’application suivante https://dsidd.shinyapps.io/interroger_qui_forme/?uai=0762762P permet de lister l’ensemble des certifications présentes dans l’outil [QuiForme](https://www.intercariforef.org/rco_search/quiforme)?  La liste de certifications repose donc sur la complétude du catalogue [QuiForme](https://www.intercariforef.org/rco_search/quiforme). 

Les données suivantes ont été utiles au prototypage :

- [ACCE]({% link data/sources.md %}),
- [Référentiel national des certifications ]({% link data/sources.md %}) du Réseau des Carif-Oref,
- [Table de passage codes certifications et formations]({% link data/sources.md %}) de l’ONISEP,
- [N_FORMATION_DIPLOME : Diplômes préparés dans les établissements du secondaire (collèges, lycées) et formations intermédiaires]({% link data/sources.md %}) de la BCN.

Les API du Réseau des Carif-Oref sont utiles:

- [API Certif Info]({% link data/sources.md %})
- [API QuiForme]({% link data/sources.md %})

Fichiers sources de l’application : [interroger_qui_forme.zip]({% link offer/interroger_qui_forme.zip %})

### Maintien et évolution du script

#### Quoi ?

Continuer à maintenir et faire évoluer le script, pour permettre à Parcoursup, mais aussi à d’autres équipes, notamment au sein du SIES, de profiter des travaux d’appariement.

#### Comment ? (proposition)

Transformer légèrement le script pour le découper en : 

- une création de table de passage entre les identifiants PS et les codes formation manipulés par les services statistiques (SISE principalement)
- interrogation par Parcoursup des différents fournisseurs de données (dont API InserJeunes et données liées à la réussite scolaire) à l’aide de cette table de passage.

Le premier élément pourra être à la charge d’un fournisseur de données ou de Parcoursup, le second sera mis en place par Parcoursup et mutualisé pour l’ensemble des producteurs utilisants des CFD / MEFSTAT11 / SISE.