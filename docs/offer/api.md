---
title: API Exposition
parent: Les outils mis à disposition
layout: default
nav_order: 4.1
---

# API Exposition

## Description

L’API Exposition InserJeunes permet **la récupération des [données InserJeunes]** (dont la “part en emploi à 6 mois” et le “taux en formation”).

Les diverses routes permettent de récupérer ces données : 

- pour une **formation / certification,** à partir d’un code MEFSTAT11, pour la voie scolaire, ou d’un code formation diplôme (CFD), pour la voie apprentissage.
- pour une **formation / certification au sein d’un établissement,** à partir d’un code MEFSTAT11 ou CFD et d’un code UAI (Unité Administrative Immatriculée).

L’API permet en outre de récupérer plusieurs de ces éléments à la fois, et propose divers filtres, par exemple pour récupérer les données à la maille régionale ou académique.

Certaines routes, mentionnées par un cadenas, nécessitent une authentification. Pour obtenir une clef API, nous vous invitons à [contacter nos équipes](mailto:contact@inserjeunes.beta.gouv.fr).

Le code source de l’API est public et disponible sur [Github].

## Documentation

Présentation et liste des routes disponibles :
[Swagger UI]

Code source : 
[Github]

## Statistiques

[Exposition - Statistiques]

[données InserJeunes]: https://documentation.exposition.inserjeunes.beta.gouv.fr/
[Github]: https://github.com/mission-apprentissage/trajectoires-pro/
[Swagger UI]: https://exposition.inserjeunes.beta.gouv.fr/api/doc/#/default/get_api_inserjeunes_formations
[Exposition - Statistiques]: https://statistiques.exposition.inserjeunes.beta.gouv.fr/
