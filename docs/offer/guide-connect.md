---
title: 'Guide : faire le lien entre votre catalogue et les données InserJeunes'
nav_exclude: true
layout: minimal
---

# Guide : faire le lien entre votre catalogue et les données InserJeunes
{: .no_toc }

{: .note }
Vous disposez d’une base de formations ou d’actions de formation (une formation dans un établissement) et souhaitez y associer les données InserJeunes. Retrouvez ci-dessous quelques pistes pour identifier les codes (CFD, MEFSTAT11, SISE) associées à vos données, qui vous permettront d’appeler l’API InserJeunes.

*Pour en savoir plus sur nos données ou notre API, rendez-vous sur [https://documentation.exposition.inserjeunes.beta.gouv.fr/](https://documentation.exposition.inserjeunes.beta.gouv.fr/).*

## Table des matières
{: .no_toc .text-delta }
- TOC
{:toc}

## Catalogue de l’apprentissage / données du RCO

Le [catalogue de l’apprentissage](https://catalogue-apprentissage.intercariforef.org/), ou les fichiers mis à disposition par le réseau des Carif-Oref (RCO), contiennent des identifiants de type CFD (formation) et UAI (établissement).

Pour ces catalogues, il est donc aisé de récupérer les données InserJeunes. Il vous suffit d’appeler notre API en fournissant le code CFD, identifiant utilisé pour l’apprentissage, et le code UAI.

## Catalogues Ideo / Onisep

Les formations “scolaires” sont identifiées dans nos système par un code MEFSTAT11, permettant un accès aux données InserJeunes de manière très granulaire.

Le catalogue [“Idéo - Actions de formation initiale - Univers lycée”](https://opendata.onisep.fr/data/605340ddc19a9/2-ideo-actions-de-formation-initiale-univers-lycee.htm) fourni par l’Onisep, ou les autres fichiers de ce type référençant les formations “scolaires”, fournissent des identifiants UAI (établissement), mais ne fournissent pas de MEFSTAT11 ou d’autres codes directement exploitables pour la formation.

Au sein de la mission (par exemple pour le catalogue de notre outil [“C’est qui le pro ?”](https://beta.gouv.fr/startups/cestquilepro.html)) et pour certains partenaires, la “recette” pour récupérer les indicateurs InserJeunes, utilisée est la suivante : 

- L’*ID Onisep*, de type *FOR.XXXX (ou l’URL correspondante de type https://www.onisep.fr/http/redirection/formation/slug/FOR.XXXX*), et la durée de formation sont extraits du fichier [“Idéo - Actions de formation initiale - Univers lycée”](https://opendata.onisep.fr/data/605340ddc19a9/2-ideo-actions-de-formation-initiale-univers-lycee.htm)
- Un code scolarité (qui est en réalité un CFD) est récupéré via le fichier [“Idéo - Formations initiales en France”](https://opendata.onisep.fr/data/5fa591127f501/2-ideo-formations-initiales-en-france.htm) à partir de l’*ID Onisep.* La durée de formation peut être retrouvée dans ce fichier aussi.
- Enfin, le code MEFSTAT11 peut être retrouvé dans le fichier de la [BCN “N_MEF”](https://infocentre.pleiade.education.fr/bcn/workspace/viewTable/n/N_MEF), à partir du code scolarité et de la durée.

Notre API peut alors être appelée en fournissant le code MEFSTAT11 et le code UAI.

## Catalogue utilisant le RNCP

🚧 Pas encore disponible.