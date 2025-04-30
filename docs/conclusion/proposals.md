---
title: Plus-value du projet et propositions pour la suite
parent: 🚧 Bilan
layout: default
nav_order: 2.2
---

# Plus-value du projet et propositions pour la suite
{: .no_toc }

## Table des matières
{: .no_toc .text-delta }
- TOC
{:toc}

## Ce que nous faisons

### Coordination et mobilisation inter-ministérielle

#### C’est quoi ?
{: .no_toc }

- **assurer la cohérence des productions de la DEPP et du SIES** (indicateurs similaires, mailles, formats, etc.)
- être moteur pour :
    - **étendre le périmètre des données** (nouveaux diplômes, autres ministères certificateurs, mailles, etc.) en fonction des besoin des réutilisateurs
    - **améliorer la couverture** au sein du périmètre

#### Risques si la mission s’arrête (sans transfert)
{: .no_toc }

- Incohérences entre les données produites par les SSM (→ imprécisions, moins de lisibilité pour les jeunes, travail technique supplémentaire pour les réutilisateurs…)
- Ralentissement de l’extension du périmètre
- Ralentissement des travaux d’amélioration de la couverture sur le périmètre

### Enrichissement des données issues des services statistiques

#### C’est quoi ?
{: .no_toc }

- Continuum (historisation des données et lien entre formations révisées)
- Lien avec d’autres référentiels : nom de la formation (BCN), libellés anciens (BCN), académie, région, etc.
- Informations liées à la fermeture éventuelle de la formation
- Gestion des différents UAI, consolidation
- Lien entre filières (scolaire et apprentissage)
- Lien entre années d’une formation et familles de métiers

#### Risques si la mission s’arrête (sans transfert)
{: .no_toc }

- Diminution drastique de la couverture
- Perte d’informations rattachées aux formations

### Démarche produit et travail UX

#### C’est quoi ?
{: .no_toc }

- Recherche utilisateur : identification et remontée des besoins, de pistes d’améliorations
- Conception : proposition et design de solutions innovantes, par exemple pour les nouveaux indicateurs ou les suggestions de formations
- Analyse : tests qualitatifs et quantitatifs, mesure d’impact
- Widgets pour les indicateurs existants (projet de widget pour les données à venir telles que la rémunération et les métiers d’avenir) permettant un visuel clair, compréhensible et une cohérence / continuité entre sites
- Documentation “grand public”

#### Risques si la mission s’arrête (sans transfert)
{: .no_toc }

- Déconnexion entre les besoin des utilisateurs et les travaux des différents services
- Visuels plus difficiles à comprendre par les utilisateurs finaux, moins percutants
- Impact plus faible

### Simplification de la réutilisation des indicateurs par les partenaires

#### C’est quoi ?
{: .no_toc }

- **Mise à disposition d’une API unique** (important notamment pour l’Onisep, PS, l’Étudiant) regroupant les données produites par la DEPP et le SIES
- Documentation technique à destination des “partenaires”
- Mise à disposition de widgets pour simplifier l’intégration et assurer un design de qualité et cohérent pour les parcours d’orientation (et projet de widgets pour d’autres indicateurs tels que la rémunération et les métiers d’avenir)
- **Accompagnement des partenaires, dont Parcoursup** et Affelnet, en amont des phases d’affectation (design des visualisations “custom”, support technique, association des données, analyse de couverture, analyse d’impact, etc.)

#### Risques si la mission s’arrête (sans transfert)
{: .no_toc }

- Surplus de travail “data / tech” pour les partenaires, qui doivent aller chercher les indicateurs auprès des 2 services stats, dans les fichiers en open data ou API (si disponible)
- baisse de couverture importante, notamment pour PS. Exposition permet de multiplier par 1.7 le taux de couverture du catalogue ParcourSup:
    - Sans api ni effort d’appariement, la couverture sur notre scope serait de 25.9%. L’utilisation de l’API permet de passer à 37% sur notre scope (grâce au continuum et au rapprochement des uai notamment). Enfin les efforts d’appariement à un code valide en amont permettent d’aboutir à une couverture 45.1% sur notre scope. 15% des formations restent sous les seuils de diffusion des données.

### Acquisition de nouvelles plateformes d’exposition et suivi de la relation

#### C’est quoi ?
{: .no_toc }

- Recherche de nouvelles plateformes (nationales ou régionales, publiques ou privées) pour exposer les indicateurs
- Accompagnement lors de la mise en oeuvre
- Suivi de la relation, mises à jour, etc.

#### Risques si la mission s’arrête (sans transfert)
{: .no_toc }

- Visibilité moindre des indicateurs
- Maîtrise plus faible des données affichées par des tiers

## Nos propositions pour la suite

### Stopper l’effort d’acquisition de nouvelles plateformes

Les plateformes intéressées peuvent récupérer les données, dialoguer avec les services, etc. mais l’effort “proactif” est stoppé pour le moment.

- Le déploiement plus large est freiné par les problèmes existants de périmètre, de couverture, de simplicité de réutilisation
- Le travail est très chronophage, pas réaliste au regard de l’équipe mobilisé

Ces travaux pourront reprendre une fois l’exposition plus mature et stabilisée pour le coeur de la cible (PS, Affelnet, Onisep).

### Reprise de l’API et des traitements données par l’un des SSM

- inclure continuum et autres traitements data
- inclure données DEPP + SIES
- (suppression possible des widgets si pas de ressources et pour déporter les réflexions design plus près des utilisateurs)

### Autonomisation des ré-utilisateurs

- Parcoursup + SIES
    - Développement et utilisation du référentiel FRESQ dans le catalogue Parcoursup (en remplacement du SISE) à horizon 2026. Permet de simplifier fortement le travail côté PS.
- Parcoursup :
    - Consolidation des identifiants du catalogue Parcoursup, notamment des codes SISE (en attendant FRESQ)
    - Travail d’appariement côté PS
- Certifinfo

### Maintenir une coordination inter-ministérielle et organiser un comité de pilotage bi-mensuel

Concernant la production de données, même si les SSM des différents ministères concernés
collaborent efficacement, une coordination interministérielle est pertinente pour :

- Assurer la cohérence de la feuille de route commune et définir des jalons ;
- Être le garant de la faisabilité de la feuille de route en mettant en adéquation ambition et moyens disponibles ;
- Être le point de relai des besoins “terrains” ;
- Garantir la cohérence des données et des définitions sur les différents systèmes techniques (InserJeunes, InserSup) ;
- Faire le lien avec les réutilisateurs de données (administrations, opérateurs, start-ups, acteurs privés) pour garantir que les productions sont utilisables et valorisables ;
- Assurer l’ouverture des données (opendata) ;
- Déceler les opportunités de nouveaux services numériques pour lancer des investigations pertinentes en lien avec la DINUM.
    

Ces travaux pourraient être assurés par une seule personne, mais qui doit avoir une légitimité
auprès des 4 ministères concernés (MEN, MESR, MTE, MTFP) via une nouvelle lettre de
mission.

Pour cette coordination nous proposons de maintenir le rythme des comités de pilotage tous les 2 mois en impliquant : 

- DEPP
- SIES
- Ré-utilisateurs principaux : Parcoursup, Affelnet, Onisep

### Lancer une investigation sur le thème de la qualité (Site IJ historique, établissement, qualité)

- les CFA et plus généralement les établissements ne savent pas comment s’approprier nos données pour suivre et piloter leur action… quand ils ne les rejettent pas.
- Il existe un site historique InserJeunes géré par la DEPP. Au-delà de la faible visibilité du site (environ 20k par an), il nous paraît important de faire évoluer ce site qui est souvent mal compris, notamment par les établissements, apporte une image biaisée d’InserJeunes et ne remplit pas sa fonction.
- Le sujet de la qualité est difficile à piloter aujourd’hui, notamment au niveau du ministère du travail et les indicateurs existants sont loin d’être suffisants.

Nous préconisons le lancement d’une investigation, avec le soutien de la DINUM, permettant d’explorer le sujet des établissements et du pilotage de la qualité au sein des ceux-ci et pouvant déboucher sur le développement en mode produit d’un site vitrine simple, ouvert au public :

- Pour explorer l'exhaustivité des données InserJeunes et InserSup par établissement ou formation ;
- Pour permettre aux établissements de retrouver les données les concernant et les afficher facilement sur leurs propres supports de communication ou signaler une mise à jour d’information ;
- Pour permettre aux décideurs et cabinets ministériels de retrouver facilement une donnée utile

À noter que certains de ces modules sont déjà développés dans “Orion” ou “C’est qui le pro ?”, ce qui pourrait faciliter la production d’un nouveau site à moindre coût.

### Insister sur le rôle des accompagnateurs via le développement de "C'est qui le pro ?"

Le rôle des accompagnateurs à l’orientation, dans le milieu scolaire ou familial, semble primordial pour améliorer et accélérer la prise en compte des données InserJeunes dans les choix d'orientation.

C’est ce qui a amené la mission à se concentrer sur le projet [C’est qui le pro ?](https://beta.gouv.fr/startups/cestquilepro.html), pour notamment toucher directement les accompagnateurs à l’orientation, professeurs principaux (de 3ème) et psychologues de l'orientation, qui jouent un rôle décisif dans l’accompagnement des plus jeunes.

Cette valorisation, dans un contexte différent, permet une articulation des données InserJeunes avec d’autres informations utiles adaptées pour les accompagnateurs pour préparer une stratégie de choix de formation ancrée dans une réalité terrain.