---
title: Résumé
parent: 🚧 Bilan
layout: default
nav_order: 2.1
---

# Résumé
{: .no_toc }

{: .note }
Une partie des informations présentées ci-après peuvent être retrouvées dans la note "Bilan de la mission interministérielle InserJeunes et préconisations pour garantir la pérennité des travaux menés" rédigée par Benjamin Barralon et Julianne Lagadec lors de l'arrêt de la mission interministérielle InserJeunes. Des informations sur les autres produits de la mission ([Sirius](https://beta.gouv.fr/startups/sirius.html), [Orion](https://beta.gouv.fr/startups/pilotagevoiepro.html) et [C'est qui le pro ?](https://beta.gouv.fr/startups/cestquilepro.html)) y sont aussi disponibles. La présente documentation reprend et enrichit cette note pour le produit d'[Exposition des indicateurs InserJeunes](https://beta.gouv.fr/startups/exposition-ij.html).

## Table des matières
{: .no_toc .text-delta }
- TOC
{:toc}

## Contexte

La lettre de mission à l'origine de la mission interministérielle InserJeunes pose comme objectif d’exposer les donnés “auprès des publics cibles, c'est-à-dire les jeunes et leurs familles en priorité”. L’enjeu est de permettre la transparence pour que ces acteurs trouvent facilement les informations à prendre en compte
pour faire un choix de formation.

[Découvrir notre mission]({{ site.baseurl }}{% link mission.md %})

## Réalisations

La mission a développé un service qui rend accessible l’information sur les chances d’obtenir un emploi en sortie de formation sur les principales plateformes d'orientation et d’affectation.

Plutôt que de miser sur un nouveau site, proposant une partie de l'information, les données sont diffusées sur les chemins d'orientation existants, par exemple sur [Onisep.fr](https://www.onisep.fr/), [Parcoursup](https://dossier.parcoursup.fr/Candidat/carte), [Affelnet](https://affectation3e.phm.education.gouv.fr/pna-public/consultation/liste-offres) ou encore [La bonne alternance](https://labonnealternance.apprentissage.beta.gouv.fr/).

Pour éviter de noyer le public cible de données et garder de la simplicité, 3 indicateurs sont proposés à tous les éditeurs de sites d’orientation : la part des jeunes dans l’emploi salarié 6 mois après la fin de la formation, la part des jeunes de poursuite d’études et les situations autres (chômage, départ à l’étranger, création d’entreprises, etc.).
Ils sont assortis de visuels et d’explications simples, pour que ces données puissent être comprises et utilisées par les jeunes et leurs familles.
Ils ont été complétés en janvier 2025 par un indicateur montrant les niveaux de rémunération des jeunes en emploi 12 mois après la formation.

Ont été réalisés :
- Des études approfondies sur la qualité et la couverture des données des catalogues de formation, avec une attention particulière pour ceux d’Affelnet et Parcoursup et des préconisations pour améliorer la couverture ;
- Des travaux pour que les données, complexes, puisse être comprises et utilisées par les jeunes : différents types de visuels disponibles selon les cibles d’une plateforme (selon l’âge et le niveau de diplôme, les attentes et besoins ne sont pas les mêmes), des explications claires sur l’utilité des indicateurs ainsi que la mise à disposition d’une documentation détaillée ;
- Des solutions techniques pour les réutilisateurs : API ou widget pour que la donnée puisse être affichée très facilement, sous un format prédéfini ou sous un format adaptable à la charte graphique de toutes les plateformes en fonction de leurs envies et besoins ;
- Des travaux de raccordement, entre les données InserJeunes et les catalogues de formation des réutilisateurs pour que les indicateurs puissent être visibles sur un maximum de formations ;
- Un bloc pour mettre en avant et expliquer les données sur les rémunérations perçues par les jeunes en emploi 1 an après la formation est prêt à être exploité ;
- Un suivi de statistiques d’utilisation et de visitorat sur les données ;
- Une première étude de l’impact de la mise à disposition des données sur Affelnet.

[En savoir plus sur nos réalisations]({{ site.baseurl }}{% link mission.md %})

## Diffusion

9 plateformes utilisent actuellement le widget ou l’API proposées par la mission : [Affelnet](https://affectation3e.phm.education.gouv.fr/pna-public/offre/A19/00812165), [Parcoursup](https://dossierappel.parcoursup.fr/Candidats/public/fiches/afficherFicheFormation?g_ta_cod=26437&typeBac=0&originePc=0), [Onisep.fr](https://www.onisep.fr/ressources/univers-formation/formations/lycees/cap-cuisine) , [La bonne alternance](https://labonnealternance.apprentissage.beta.gouv.fr/formation/115708P01215089042240004750890422400047-91216%23L01/cuisine?romes=G1603%2CG1402%2CG1602%2CG1604%2CG1601%2CG1401), 1 jeune 1 solution, IJ box (outil proposé par le réseau Information Jeunesse), Diagoriente, l’Etudiant et Octopilot.

20 sont envisagées dans le contrat FTAP : 16 autres interlocuteurs (régions, Carif-Oref, edtech, associations) ont été invités à utiliser ces outils, 12 sont en réflexion, dont 3 avec lesquels les échanges sont très avancés.

Il est difficile de convaincre et d'outiller les conseils régionaux, les outils proposés pour la découverte des métiers et formations étant très hétérogènes. Les edtechs sont intéressées mais disposent souvent d’équipes et de roadmaps restreintes. En outre, le périmètre et la couverture encore partiels représentent un frein pour que ces plateformes se lancent.

500 000 accès aux données sont attendus par mois dans le contrat du FTAP. On comptabilise plus de 650 000 appels à l’API en moyenne par mois en décembre 2024.

[Enseignements : Déploiement]({{ site.baseurl }}{% link conclusion/deployment.md %})

## Impact

Malgré les études de plus en plus avancées menées, notamment dans le cadre des campagnes Affelnet, nous n'avons pas été en mesure d'isoler l'impact précis de l'exposition des données sur l'évolution des vœux. Les protocoles mis en œuvre et les données récoltées ne permettaient pas de mesurer la contribution individuelle de nos travaux dans ce problème multi-factoriel.

Les tests menés auprès de jeunes montrent :

- qu'un grand nombre n'est pas encore exposé à la donnée ou ne la voit pas,
- que parmi les autres, une partie ne les lit pas ou comprend moyennement la signification et l'incidence des chiffres exposés,
- que l'information est priorisée par un pourcentage faible de jeunes qui la voient et comprennent ce qu’ils peuvent en faire. Ces individus considèrent la donnée comme très éclairante.

[Enseignements : Impact]({{ site.baseurl }}{% link conclusion/impact.md %})

## Conclusion et recommandations

La transparence sur les débouchés est indispensable, mais on constate qu’il faudra quelques années et beaucoup de pédagogie pour que ces données influencent significativement les choix d’orientation.

Au regard des ressources limitées à disposition, des difficultés associées à l'exposition sur les plateformes régionales ou edtech, et du besoin de consolider l'offre (extension du périmètre, amélioration de la couverture, simplification de l'identification des formations, etc.) il nous semble pertinent de stopper l'effort d'acquisition de nouvelles plateformes pour recentrer l'effort sur les plateformes d'exposition actuelles (ou celles, déjà volontaires et matures pour exposer la donnée).

Il est en outre indispensable  :

- mener à bien le chantier de reprise des travaux de l'équipe par les services statistiques et les ré-utilisateurs ;
- maintenir des échanges interministériels entre les divers acteurs, producteurs ou ré-utilisateurs, impliqués dans le dispositif (choix des priorités d'extension du périmètre, remontée des retours terrain, cohérence des dpnnées, uniformité des modules de visualisation, etc.) ;
- continuer à enrichir les indicateurs, à étendre le périmètre, à améliorer la couverture au sein de ce périmètre et à actualiser les données ;
- faire évoluer le [site vitrine InserJeunes](https://www.inserjeunes.education.gouv.fr/diffusion/accueil), peu consulté mais problématique (notamment vis à vis des CFA).

Enfin, le rôle des accompagnateurs à l’orientation, dans le milieu scolaire ou familial, semble primordial pour améliorer et accélérer la prise en compte des données InserJeunes dans les choix d'orientation. C’est ce qui a amené la mission à se concentrer sur le projet “C’est qui le pro ?”, pour notamment toucher directement les accompagnateurs à l’orientation qui jouent un rôle décisif dans l’accompagnement des plus jeunes (3ème). Cette valorisation, dans un contexte différent, permet une articulation des données InserJeunes avec d’autres informations utiles adaptées pour les accompagnateurs pour préparer une stratégie de choix de formation ancrée dans une réalité terrain.

[Nos propositions pour la suite]({{ site.baseurl }}{% link conclusion/proposals.md %})