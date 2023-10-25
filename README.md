# EXPOSITION

Dépôt de l'[API exposition d'InserJeunes](https://exposition.inserjeunes.beta.gouv.fr/api/doc/).

Cette API met à disposition les données InserJeunes.

## Développement

### Pré-requis

- Yarn 1+
- Docker 19 +
- Docker-compose 2.21+

### Démarrage

Pour lancer l'application :

```sh
make install
make start
```

Cette commande démarre les containers définis dans le fichier `docker-compose.yml` et `docker-compose.override.yml`

L'application est ensuite accessible à l'url [http://localhost](http://localhost)

### Jobs

Pour hydrater la base de données, il existe dans le package `server` plusieurs jobs différents.
```
cd server
yarn cli NOM_DU_JOB
```

L'ordre d'exécution des jobs est important afin de pouvoir hydrater correctement la base de données.
```
yarn cli importBCN
yarn cli importStats
yarn cli computeContinuumStats
```

```
yarn cli importBCN (S'il n'a pas déjà été effectué)
yarn cli importRomes
```

#### Détails des principaux Jobs
- `importBCN` : Importation des formations depuis la BCN.
  - Importation des fichiers de la BCN
    - [N_FORMATION_DIPLOME](https://infocentre.pleiade.education.fr/bcn/workspace/viewTable/n/N_FORMATION_DIPLOME)
    - [V_FORMATION_DIPLOME](https://infocentre.pleiade.education.fr/bcn/workspace/viewTable/n/V_FORMATION_DIPLOME)
    - [N_MEF](https://infocentre.pleiade.education.fr/bcn/workspace/viewTable/n/N_MEF)
  - Création des liens de continuités ([cf](<#continuit%C3%A9-des-donn%C3%A9es-dans-le-cadre-de-la-renovation-des-formations>)) entre les formations
- `importRomes` :
  - Importation des codes ROMEs depuis l'API [api.data.gouv] (Voir [dataset](https://www.data.gouv.fr/fr/datasets/repertoire-operationnel-des-metiers-et-des-emplois-rome/))
  - Importation depuis l'API [Diagoriente](https://odyssey-docs.vercel.app/docs/intro) des :
    - Code ROMEs des formations
    - Des métiers d'avenir
  - Création du liens formations <> métiers d'avenir
- `importStats` :
  - Importation des données InserJeunes :
    - `importStats formations` : Importation des données de formation au niveau établissement
      - Utilise les listes d'établissements contenues dans `server/data`
    - `importStats certifications` : Importation des données de formation au niveau nationale
    - `importStats regionale` : Importation des données au niveau régionale
- `computeContinuumStats` : Calcul des données de continuités des formations ([cf](<#continuit%C3%A9-des-donn%C3%A9es-dans-le-cadre-de-la-renovation-des-formations>)) 

### Outils

Nous utilisons [Commit-lint](https://commitlint.js.org/#/) avec [conventional-commits](https://www.conventionalcommits.org/en/v1.0.0-beta.2/#why-use-conventional-commits)

### Tests

1. Linter
```
make lint
```

2. Tests unitaires
```
make test
```

### Architecture

Le monorepo est composé d'un package back-end situé dans `server` ainsi que d'un package front-end situé dans `ui`.

#### Server

Ce package contient le code de l'API.

#### Ui

Ce package contient le front-end qui est divisé en différentes applications :
- **explorer** : Site interne de consultation des données de l'API
- **statistiques** : [Page des statistiques](https://statistiques.exposition.inserjeunes.beta.gouv.fr/) du projet Exposition

#### Base de données

Ce projet utilise `mongodb` version 5.


## Fonctionnement

### Exemples

Voir documentation de l'API : https://exposition.inserjeunes.beta.gouv.fr/api/doc/

### Continuité des données dans le cadre de la renovation des formations

Afin d'assurer la continuité des données en cas de rénovation des formations, nous associons les données d'une formation renovée avec les données de la formation historique lorsque :
- La formation rénovée ne fait pas l'objet d'une modification profonde de ses modules
- La formation renovée n'a pas de données pour le millésime concerné

Nous associons également, dans le sens inverse, les données de la formation rénovée avec les formations historiques lorsque celles ci ne possèdent pas de données pour le millésime concerné.

#### Exemple d'une formation rénovée

Le Bac Pro GA (Gestion Administration, CFD 40030001) a été remplacé par le Bac Pro AGORA (Assistance à la gestion des organisations et de leurs activités, CFD 40030004).

Pour le millésime 2021, nous n'avons pas de données pour le Bac Pro AGORA nous associons donc les données 2021 du Bac Pro GA au Bac Pro AGORA.

[Donnée 2021 Bac Pro AGORA](https://exposition-recette.inserjeunes.beta.gouv.fr/api/inserjeunes/certifications/40030004?millesime=2021) : 
Ces données correspondent donc aux [données 2021 du Bac Pro GA](https://exposition-recette.inserjeunes.beta.gouv.fr/api/inserjeunes/certifications/40030001?millesime=2021)

Il est possible de savoir si les données proviennent d'une formation historique via l'attribut `donnee_source` de la réponse.
```
"donnee_source": {
    "code_certification": "40030001", // Code de la formation d'ou proviennent les données
    "type": "ancienne" // ancienne : indique que les données proviennent de la formation historique
},
```

#### Exemple d'une formation historique

Le CAP Sérrurier Métallier (CFD 50025431) a remplacé le CAP Métallerie (CFD 50025420). Pour le millésime 2021, nous n'avons pas de données pour le CAP Métallerie. Nous associons donc les données 2021 du CAP Sérrurier Métallier au CAP Métallerie.

[Donnée 2021 CAP Métallerie](https://exposition-recette.inserjeunes.beta.gouv.fr/api/inserjeunes/certifications/50025420?millesime=2021) : 
Ces données correspondent donc aux [données 2021 du CAP Sérrurier Métallier](https://exposition-recette.inserjeunes.beta.gouv.fr/api/inserjeunes/certifications/50025431?millesime=2021)

Il est possible de savoir si les données proviennent d'une formation plus récente via l'attribut `donnee_source` de la réponse.
```
"donnee_source": {
    "code_certification": "50025431", // Code de la formation d'ou proviennent les données
    "type": "nouvelle" // nouvelle : indique que les données proviennent de la formation rénovée
},
```

 


![](https://avatars1.githubusercontent.com/u/63645182?s=200&v=4)
