# Journal des modifications

## 23/09/20200

Nous avons mis en en recette la nouvelle version de l'API.

### Nouvelles statistiques

Le changement le plus important concerne les données renvoyées par l'API.
En effet pour les certifications et les formations, l'API retournait les statistiques suivantes :

- nb_annee_term
- nb_en_emploi_12_mois
- nb_en_emploi_6_mois
- nb_poursuite_etudes
- nb_sortant
- taux_emploi_12_mois
- taux_emploi_6_mois
- taux_poursuite_etudes
- taux_rupture_contrats

La nouvelle version retourne désormais les statistiques suivantes :

- nb_annee_term
- nb_en_emploi_6_mois
- nb_en_emploi_12_mois
- nb_en_emploi_18_mois
- nb_en_emploi_24_mois
- nb_poursuite_etudes
- nb_sortant
- taux_autres_6_mois
- taux_autres_12_mois
- taux_autres_18_mois
- taux_autres_24_mois
- taux_en_emploi_6_mois
- taux_en_emploi_12_mois
- taux_en_emploi_18_mois
- taux_en_emploi_24_mois
- taux_en_formation
- taux_rupture_contrats

### Ajout des routes régionales

Nous avons ajouté des routes qui permettent d'obtenir les statistiques à l'échelle régionale.

Le fonctionnement de ces routes est identique aux routes certifications et formations.
Il est donc possible d'obtenir la liste les statistiques pour toutes les régions ou pour une seule région via son code
INSEE.

### Filières

Il est désormais possible d'appeler la route `/api/inserjeunes/certifications/:codes_certifications` avec un
paramètre `vue=filieres`.

Ce paramètre permet d'obtenir les statistiques agrégées par filière (pro et apprentissage).
L'API se charge de trouver les différents codes certifications.

Pour obtenir les statistiques agrégées il fallait auparavant appeler la route avec tous les codes
certifications. Ce n'est désormais plus nécessaire

Par exemple l'appel `/api/inserjeunes/certifications/32022317,32221022317` peut être remplacé
par

`/api/inserjeunes/certifications/32022317?vue=filieres`

ou

`/api/inserjeunes/certifications/32221022317?vue=filieres`


Il est toujours possible d'appeler cette route avec tous les codes.

![](https://avatars1.githubusercontent.com/u/63645182?s=200&v=4)
