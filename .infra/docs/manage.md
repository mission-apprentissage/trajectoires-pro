# Gestion de l'infrastructure

- [Prérequis](#prérequis)
  - [GPG](#gpg)
- [Configuration d'un nouveau cluster](#configuration-dun-nouveau-cluster)
- [Déclaration de l'environnement](#déclaration-de-lenvironnement)

## Prérequis

La configuration de l'infrastructure nécessite :

- [Terraform](https://developer.hashicorp.com/terraform) 1.12+ : Uniquement nécessaire pour la configuration du cluster Kubernetes
- [Ansible](https://docs.ansible.com/) 2.18+
- [Helm](https://helm.sh/) 3.14+
- [Kubectl](https://kubernetes.io/fr/docs/tasks/tools/install-kubectl/) 1.32+
- [Docker](https://docs.docker.com/) 28.3+

### GPG

Pour utiliser le projet infra, vous devez avoir une clé GPG, si ce n'est pas le cas, vous pouvez en créer une via la
commande :

```bash
 bash scripts/create-gpg-key.sh <prénom> <nom> <email>
```

Une fois terminé, le script va vous indiquer l'identifiant de votre clé GPG. Afin qu'elle puisse être utilisée au sein
de la mission apprentissage, vous devez publier votre clé :

```bash
gpg --send-key <identifiant>
```

Il est vivement conseillé de réaliser un backup des clés publique et privée qui viennent d'être créés.

```bash
gpg --export <identifiant> > public_key.gpg
gpg --export-secret-keys <identifiant> > private_key.gpg
```

Ces deux fichiers peuvent, par exemple, être stockés sur une clé USB.

## Configuration d'un nouveau cluster

La configuration d'un nouveau cluster n'a pas été répliquée sur ce repository. Ce projet partage l'infrastructure
du projet [`C'est qui le pro ?`]((https://github.com/mission-apprentissage/c-est-qui-le-pro/)

Vous pouvez vous référer à la partie [Configuration d'un nouveau cluster](https://github.com/mission-apprentissage/c-est-qui-le-pro/blob/main/.infra/docs/manage.md#configuration-dun-nouveau-cluster) de ce projet.

## Déclaration de l'environnement

Le fichier `env.ini` définit les environnements de l'application. Il faut donc ajouter le nouvel environnement
dans ce fichier en renseignant les informations suivantes :

```
[<nom de l'environnemnt>]
<nom de l'environnemnt>-localhost ansible_host=127.0.0.1 ansible_connection=local  ansible_python_interpreter={{ansible_playbook_python}}
[<nom de l'environnemnt>:vars]
env_type=<nom de l'environnemnt>
env_name=<nom de l'environnemnt>
dns_name=<nom de l'application>.inserjeunes.beta.gouv.fr
app_namespace=<nom du namespace>
```

Editer le vault pour créer les env-vars liés à ce nouvel environnement (cf: [Vault](./vault.md))
