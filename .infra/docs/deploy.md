# Déploiement

L'application est déployée sur un cluster Kubernetes. Vous pouvez déployer l'application sur les différents environnements ainsi que sur l'environnement spécial `dev`.

Chaque environnement est déployé dans un namespace différent sur le cluster Kubernetes.

L'environnement `dev` vous permet de déployer une branche et de l'associer à une url temporaire de type: `<image-version>.<url-de-la-recette>`. Certain composants de l'application ne seront pas déployé sur l'environnement `dev` (ex: Metabase)

/!\ Actuellement la base de données de la recette et de l'environnement `dev` est partagé.

## Depuis Github actions

### Construire l'image Docker

Une image Docker est créée :

- Pour l'environnement `dev` : à chaque push lorsqu'il existe une pull request vers main
- Pour l'environnement `production` : à chaque release (nouveau tag)
- Pour l'environnement `recette` : il est nécessaire de construire l'image manuellement en utilisant la Github action `build-dev` sur la branche à construire et de renseigner les informations demandées.

Le tag des images correspondra à : `<nom-de-lenvironnement>-<nom-de-la-branche/tag>`

### Deployer

Utiliser la Github action `deploy` sur la branche/tag à déployer puis renseigner les informations demandées :

- Nom de l'environnement
- Version de l'image : Version des images sans le nom de l'environnement (ex: `<nom-de-la-branche/tag>`)

### Déploiement Manuel

#### Prérequis

Voir Prérequis dans (Gestion de l'infrastructure)[./manage.md]

#### Construire l'image Docker

```bash
bash scripts/build-app.sh <nom-de-lenvironnement> <app_image_version>
```

- `nom-de-lenvironnement`
- `image-version`: Tag des images sur le repository (sans le nom de l'environnement)

#### Déployer

```bash
bash scripts/deploy-app.sh <nom-de-lenvironnement> <app_image_version>
```

- `nom-de-lenvironnement`
- `image-version`: Tag des images sur le repository (sans le nom de l'environnement) à déployer. Correspond également au nom du namespace pour l'environnement `dev` ainsi qu'à son url `<image-version>.<url-de-la-recette>`
