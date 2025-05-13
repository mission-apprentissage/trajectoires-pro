---
title: Base de données & Indicateurs
parent: Données et traitements
layout: default
nav_order: 3.1
---

# Base de données & Indicateurs

{: .no_toc }

## Table des matières

{: .no_toc .text-delta }

- TOC
{:toc}

## Contenu

Nous collectons les données diffusées par les services statistiques du **Ministère de l’Éducation nationale et de la jeunesse** **(DEPP)**, du **Ministère de l’Enseignement supérieur, de la Recherche et de l’Innovation (SIES),** du **Ministère du Travail, du Plein emploi et de l'Insertion (DARES)** ainsi que d’autres entités (voir [Jeux de données manipulés]({{ site.baseurl }}{% link data/sources.md %})).

Ces données sont connectées, croisées, enrichies et viennent peupler notre propre base de donnée dont l’objectif et de servir de source d’information accessible, fiable, utile et complète pour chacune des étapes du parcours allant du collège à l’emploi (le parcours de formation vers l’emploi).

Notre base contient des données issues des bases des services statistiques ci-dessus et des indicateurs calculés par nos soins, dont :

- Le **taux d’étudiants en emploi en sortie de formation** (**à 6 mois**, 12 mois, 18 mois et 24 mois) et les effectifs correspondants
- Le **taux d’étudiants poursuivant leur formation** et les effectifs correspondants
- Le **taux d’étudiants poursuivant un autre type de parcours** et les effectifs correspondants
- La rémunération 12 mois après la sortie de formation
- les effectifs en année terminale
- les effectifs sortants
- le taux de rupture de contrats pour l’apprentissage

Les 3 éléments en gras sont les “indicateurs InserJeunes”, ayant pour finalité d’être exposés pour éclairer les choix d’orientation.

Les données sont disponibles pour chaque certification / formation :

- pour différents **millésimes** (2019 à 2023)
- à l’**échelle nationale, régionale ou pour un établissement**
- pour la **voie scolaire** ou pour l’**apprentissage** (si existant)

Les données de rémunération ne sont disponibles aujourd’hui qu’à l’échelle nationale, pour le millésime 2021.

Mode de calcul des indicateurs : [📚 Centre de documentation InserJeunes]({{ site.baseurl }}{% link offer/documentation/documentation-general.md %})

## Périmètre et Couverture

Depuis 2021, sont produits chaque année par les services statistiques, pour toutes les formations du CAP au BTS dispensées dans des lycées professionnels ou CFA :

- Les taux d’insertion dans l’emploi salarié en France à 6, 12 18 et 24 mois des sortants
  de formation ;
- Les taux de poursuite d'études ;
- La valeur ajoutée des établissements, c’est à dire leur capacité à insérer en prenant en compte le profil social des apprenants et le taux de chômage de la zone d’emploi comparativement à des établissements similaires ;
- Le taux d’interruption en cours de formation ainsi que, pour chaque centre de formation d'apprentis, le taux de rupture des contrats d'apprentissage.

Depuis 2022 les services statistiques ont œuvré à l’évolution du dispositif InserJeunes avec le soutien de la mission InserJeunes sur 2 axes : son enrichissement et son extension. Ces données sont produites, vérifiées et publiées de manière récurrente tous les ans.

### Enrichissement

Après 2 ans de travaux , les résultats notables de l’enrichissement du dispositif portent sur :

- La prise en compte de l’emploi public dans le taux d’insertion;
- Le calcul des indicateurs à une maille régionale;
- La qualification de la stabilité de l’emploi occupé après la formation (CDD, CDI, interim);
- L’information sur les rémunérations et leur distribution un an après la sortie de formation;
- Des premières briques sont posées pour mieux qualifier le taux d’insertion dans l’emploi et le taux de poursuite d’études :
  - Pour obtenir des précisions sur le pourcentage de jeunes qui occupent un emploi en lien avec leur formation, la DEPP a publié une note d'information en juin 2023 et la DARES, a exposé une publication. Ces travaux ponctuels sont les premières étapes à la construction d’indicateurs récurrents attendus en 2025 pour déterminer à une granularité fine si une formation donnée mène à l’emploi pour lequel la formation a préparé le jeune.
  - Pour des détails sur la constitution du taux de poursuite d’études (réorientation, redoublement, poursuite…), la DEPP a initié d‘importants travaux pour mettre en œuvre un dispositif de suivi de cohortes exhaustif. Ces travaux de base doivent donner lieu à des résultats et des publications en 2025.

### Extension

Au début de la mission, InserJeunes donnait des informations seulement sur les formations de la voie professionnelle du CAP au BTS. Un calendrier ambitieux est depuis déployé pour disposer des débouchés de davantage de niveaux de formation ou de domaines de formation.

Sont couverts fin 2024 :

- Les licences professionnelles ;
- Les licences générales ;
- Les masters ;
- Les formations de l’enseignement agricole ;
- Les diplômes proposés par les écoles de commerce et d’ingénieur.

### Contenu détaillé

Le contenu de la base (par type de diplôme couvert, aux diverses mailles) ainsi que des analyses de couvertures détaillées sur les catalogues des ré-utilisateurs (tels que Parcoursup ou Affelnet) sont accessibles sur la page dédiée : [Couverture]({{ site.baseurl }}{% link data/couverture_catalogue/README.md %}).

## Limites

Au delà des **éléments non-couverts à date**, certaines limites peuvent actuellement expliquer l’absence de données (dans notre base ou notre API) pour certain(e)s certifications / formations / établissements :

- nous ne disposons pas de données pour les éléments dont l’**effectif est inférieur à 5 personnes**
- nous ne pouvons pas diffuser de données pour les éléments dont l’**effectif est inférieur à 20 personnes**

Certaines autres limites entraînent une classification “trompeuse” (entre emploi, formation et autre) :

- l’**emploi public** n’est pas pris en compte (effectifs non intégrés) dans les millésimes avant 2022.
- l’**emploi non salarié** (par exemple les auto-entrepreneurs) n’est pas comptabilisé. Les effectifs correspondants se retrouvent dans “Autres parcours” et pas dans “En emploi”.
- l’**emploi à l’étranger** n’est pas comptabilisé. Les effectifs correspondants se retrouvent dans “Autres parcours” et pas dans “En emploi”.
- “En emploi” ne signifie pas que la personne est en emploi sur un poste correspondant à la formation. Il n’y a **pas forcément de lien entre les emplois occupés et les formations réalisées**.
