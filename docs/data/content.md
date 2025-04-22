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

Nous collectons les données diffusées par les services statistiques du **Ministère de l’Éducation nationale et de la jeunesse** **(DEPP)**, du **Ministère de l’Enseignement supérieur, de la Recherche et de l’Innovation (SIES),** du **Ministère du Travail, du Plein emploi et de l'Insertion (DARES)** ainsi que d’autres entités (voir [Jeux de données manipulés]({% link data/sources.md %})).

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

Mode de calcul des indicateurs : [Exposition - Documentation](https://documentation.exposition.inserjeunes.beta.gouv.fr/#154d0d8ec01580f4a3dafe6164a0076c)

## Couverture

Voir : [Analyses](https://mission-apprentissage.github.io/trajectoires-pro/analyse/couverture_catalogue/base_inserjeunes/base_inserjeunes_production_2024_06.html)

## Limites

Au delà des **éléments non-couverts à date**, certaines limites peuvent actuellement expliquer l’absence de données (dans notre base ou notre API) pour certain(e)s certifications / formations / établissements : 

- nous ne disposons pas de données pour les éléments dont l’**effectif est inférieur à 5 personnes**
- nous ne pouvons pas diffuser de données pour les éléments dont l’**effectif est inférieur à 20 personnes**

Certaines autres limites entraînent une classification “trompeuse” (entre emploi, formation et autre) : 

- l’**emploi public** n’est pas pris en compte (effectifs non intégrés) dans les millésimes avant 2022.
- l’**emploi non salarié** (par exemple les auto-entrepreneurs) n’est pas comptabilisé. Les effectifs correspondants se retrouvent dans “Autres parcours” et pas dans “En emploi”.
- l’**emploi à l’étranger** n’est pas comptabilisé. Les effectifs correspondants se retrouvent dans “Autres parcours” et pas dans “En emploi”.
- “En emploi” ne signifie pas que la personne est en emploi sur un poste correspondant à la formation. Il n’y a **pas forcément de lien entre les emplois occupés et les formations réalisées**.