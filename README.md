# EXPOSITION

Dépôt de l'[API exposition d'InserJeunes](https://exposition.inserjeunes.beta.gouv.fr/api/doc/).

Cette API met à disposition les données InserJeunes.

## Développement

### Pré-requis

- Node 18+
- Yarn 1+
- Docker 28 +
- Docker-compose 2.33+

### Variable d'environnement

Certaine variable d'environnement sont requises pour démarrer le projet et importer les données.

#### Backend

- TRAJECTOIRES_PRO_AUTH_JWT_SECRET: Utiliser pour signer les JWTs. Voir [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- Accès à l'API InserJeunes de la DEPP
  - TRAJECTOIRES_PRO_INSERJEUNES_USERNAME
  - TRAJECTOIRES_PRO_INSERJEUNES_PASSWORD
- Accès à l'API InserSup du SIES
  - TRAJECTOIRES_PRO_INSERSUP_BASE_URL
  - TRAJECTOIRES_PRO_INSERSUP_API_KEY
- Accès au catalogue de l'apprentissage
  - CATALOGUE_APPRENTISSAGE_USERNAME
  - CATALOGUE_APPRENTISSAGE_PASSWORD
- TRAJECTOIRES_PRO_API_KEY: Api key statique pour accèder aux routes protéger de l'API exposition (son usage est déprécié en faveur de la création d'utilisateur, elle ne doit plus être partagée).

#### UI

Voir [.env.example.local](ui/.env.example.local)

### Démarrage

Pour lancer l'application :

```sh
make install
make start
```

Cette commande démarre les containers définis dans le fichier `docker-compose.yml` et `docker-compose.override.yml`

L'application est ensuite accessible à l'url [http://localhost](http://localhost)

#### Accès aux différents frontends

Vous pouvez accèder aux différents frontends en utilisant les urls configurées dans vos environnements :

- INTERNAL_SITE_HOST : url d'accès à explorer
- STATISTIQUES_SITE_HOST : url d'accès à la page statistiques
- DOCUMENTATION_SITE_HOST : url d'accès à la documentation

Il sera peut être nécessaire d'ajouter les valeurs de ces environnements à votre fichier hosts (Pas nécessaire sur Mac os pour les domaines de type \*.localhost)

Exemple :
`127.0.0.1 explorer.localhost`

### Jobs

Pour hydrater la base de données, il existe dans le package `server` plusieurs jobs différents.

```
cd server
yarn cli NOM_DU_JOB
```

L'ordre d'exécution des jobs est important afin de pouvoir hydrater correctement la base de données.

##### Importation de toute les données

```
yarn cli importAll
```

##### Importation des données InserJeunes

```
yarn cli importBCN
yarn cli importEtablissements
yarn cli importStats
yarn cli importSupStats
yarn cli computeContinuumStats
yarn cli importAnneesNonTerminales
```

##### Importation des données du catalogue de l'apprentissage et association des UAIs

/!\ L'importation des données de formation au niveau établissement doit être déjà effectuée

```
yarn cli importCatalogueApprentissage
yarn cli computeUAI
```

#### Détails des principaux Jobs

- `importAll` : Effectue toute les taches d'importations et de calculs des données.
- `importBCN` : Importation des formations depuis la BCN.
  - Importation des fichiers de la BCN
    - [N_FORMATION_DIPLOME](https://bcn.depp.education.fr/bcn/workspace/viewTable/n/N_FORMATION_DIPLOME)
    - [V_FORMATION_DIPLOME](https://bcn.depp.education.fr/bcn/workspace/viewTable/n/V_FORMATION_DIPLOME)
    - [N_MEF](https://bcn.depp.education.fr/bcn/workspace/viewTable/n/N_MEF)
  - Création des liens de continuités ([cf](#continuit%C3%A9-des-donn%C3%A9es-dans-le-cadre-de-la-renovation-des-formations)) entre les formations
  - Importation des familles de métiers
    - `data/bcn/n_famille_metier_spec_pro.csv` : Liste des familles de métiers, ce fichier a pour base [N_FAMILLE_METIER_SPEC_PRO](https://bcn.depp.education.fr/bcn/workspace/viewTable/n/N_FAMILLE_METIER_SPEC_PRO) auquel a été ajouté des familles de métiers manquantes.
    - `data/bcn/n_lien_mef_famille_metier.csv`: Liens entre une formation et sa famille de métier, ce fichier a pour base [N_LIEN_MEF_FAMILLE_METIER](https://bcn.depp.education.fr/bcn/workspace/viewTable/n/N_LIEN_MEF_FAMILLE_METIER) auquel a été ajouté les années qui ne correspondent pas aux années communes.
- `importEtablissements` :
  - Importation des établissements depuis le fichier établissements de l'ACCE
- `importStats` :
  - Importation des données InserJeunes :
    - `importStats formations` : Importation des données de formation au niveau établissement
      - Utilise les listes d'établissements contenues dans `server/data`
    - `importStats certifications` : Importation des données de formation au niveau nationale
    - `importStats regionale` : Importation des données au niveau régionale
- `importSupStats` :

  - Importation des données InserSup :
    - `importStats formations` : Importation des données de formation au niveau établissement
      - Utilise l'API Insersup
    - `importStats certifications` : Importation des données de formation au niveau nationale
      - Utilise l'opendata Insersup
    - L'importation des données au niveau régionale n'est pas encore disponible pour le supérieur

- `computeContinuumStats` : Calcul des données de continuités des formations ([cf](#continuit%C3%A9-des-donn%C3%A9es-dans-le-cadre-de-la-renovation-des-formations))

- `importAnneesNonTerminales` : Associe les statistiques aux années non terminales (Ex: associe les données d'une terminale à sa seconde et sa première)

- `importCatalogueApprentissage` :
  - Importation des formations depuis le catalogue de l'apprentissage des ministères éducatifs.
- `computeUAI` :
  - Utilise le catalogue de l'apprentissage pour identifier les UAIs des données de formation au niveau établissement.
  - Associe les données aux lieux de formations lorsque cela est possible.
- `user` :
  - `create` : Ajoute un utilisateur à l'API
  - `remove` : Supprime un utilisateur à l'API

### Mise à jour des données

#### Nouveau millésime

Mettre à jour les variables d'environnements avec le millesime a ajouté:

- `TRAJECTOIRES_PRO_MILLESIMES`
- `TRAJECTOIRES_PRO_MILLESIMES_FORMATIONS`
- `TRAJECTOIRES_PRO_MILLESIMES_REGIONALES`

Ajoutés les fichiers suivant (MILLESIME sur deux années):

- `depp-2022-etablissements-MILLESIME-apprentissage.csv`
- `depp-2022-etablissements-MILLESIME-pro.csv`

Mettre à jour le fichier suivant :

- `data/acce_etablissements.csv`

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

La documentation du projet Exposition est content dans le dossier `docs`.

#### Server

Ce package contient le code de l'API.

#### Ui

Ce package contient le front-end qui est divisé en différentes applications :

- **explorer** : Site interne de consultation des données de l'API
- **statistiques** : [Page des statistiques](https://statistiques.exposition.inserjeunes.beta.gouv.fr/) du projet Exposition

#### Docs

Dossier contenant la documentation du projet Exposition.

Utilise Jekyll et est déployé automatiquement en tant que Github Pages.

Voir [workflow](.github/workflows/jekyll-gh-pages.yml) pour le déploiement.

#### Base de données

Ce projet utilise `mongodb` version 5.

## [Déploiement](.infra/README.md)

### Jobs

Pour exécuter les jobs sur le serveur il faut :

- Se connecter en SSH au serveur
- Utiliser la commande : `sudo bash /opt/trajectoires-pro/cli.sh`

## Fonctionnement

### Exemples

Voir documentation de l'API : https://exposition.inserjeunes.beta.gouv.fr/api/doc/

### Continuité des données dans le cadre de la rénovation des formations

Afin d'assurer la continuité des données en cas de rénovation des formations, nous associons les données d'une formation renovée avec les données de la formation historique lorsque :

- La formation rénovée ne fait pas l'objet d'une modification profonde de ses modules
- La formation rénovée n'a pas de données pour le millésime concerné

Nous associons également, dans le sens inverse, les données de la formation rénovée avec les formations historiques lorsque celles ci ne possèdent pas de données pour le millésime concerné.

#### Exemple d'une formation rénovée

Le Bac Pro GA (Gestion Administration, CFD 40030001) a été remplacé par le Bac Pro AGORA (Assistance à la gestion des organisations et de leurs activités, CFD 40030004).

Pour le millésime 2021, nous n'avons pas de données pour le Bac Pro AGORA nous associons donc les données 2021 du Bac Pro GA au Bac Pro AGORA.

[Donnée 2021 Bac Pro AGORA](https://exposition.inserjeunes.beta.gouv.fr/api/inserjeunes/certifications/40030004?millesime=2021) :
Ces données correspondent donc aux [données 2021 du Bac Pro GA](https://exposition.inserjeunes.beta.gouv.fr/api/inserjeunes/certifications/40030001?millesime=2021)

Il est possible de savoir si les données proviennent d'une formation historique via l'attribut `donnee_source` de la réponse.

```
"donnee_source": {
    "code_certification": "40030001", // Code de la formation d'ou proviennent les données
    "type": "ancienne" // ancienne : indique que les données proviennent de la formation historique
},
```

#### Exemple d'une formation historique

Le CAP Sérrurier Métallier (CFD 50025431) a remplacé le CAP Métallerie (CFD 50025420). Pour le millésime 2021, nous n'avons pas de données pour le CAP Métallerie. Nous associons donc les données 2021 du CAP Sérrurier Métallier au CAP Métallerie.

[Donnée 2021 CAP Métallerie](https://exposition.inserjeunes.beta.gouv.fr/api/inserjeunes/certifications/50025420?millesime=2021) :
Ces données correspondent donc aux [données 2021 du CAP Sérrurier Métallier](https://exposition.inserjeunes.beta.gouv.fr/api/inserjeunes/certifications/50025431?millesime=2021)

Il est possible de savoir si les données proviennent d'une formation plus récente via l'attribut `donnee_source` de la réponse.

```
"donnee_source": {
    "code_certification": "50025431", // Code de la formation d'ou proviennent les données
    "type": "nouvelle" // nouvelle : indique que les données proviennent de la formation rénovée
},
```

![](https://avatars1.githubusercontent.com/u/63645182?s=200&v=4)
