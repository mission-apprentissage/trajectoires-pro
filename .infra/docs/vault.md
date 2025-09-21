# Gestion des secrets

## Gestion du vault

- [Création du vault](#création-du-vault)
- [Edition du vault](#edition-du-vault)
- [Variables du vault](#variables-du-vault)
- [Habilitations](#habilitations)
  - [Ajout d'un utilisateur](#ajout-dun-utilisateur)
  - [Suppression d'un utilisateur](#suppression-dun-utilisateur)

Il est vivement recommander de stocker toutes les variables d'environnement sensibles (ex: token) dans un vault Ansible.
Le fichier `vault/vault.yml` contient déjà les données jugées sensibles.

### Création du vault

Dans un premier temps, vous devez générer le mot de passe du vault. Ce mot de passe sera chiffré via GPG et pourra
uniquement être obtenu par les personnes listées dans le fichier `vault/habilitations.yml`

Pour se faire, lancez la commande suivante :

```bash
  bash scripts/vault/generate-vault-password.sh
```

Cette commande va créer le fichier `vault/.vault-password.gpg`, vous ne devez pas le commiter.

Il est nécessaire de stocker ce fichier de manière sécurisé (ex: dans un fichier sur 1password).

Le mot de passe contenu dans ce fichier va permettre de chiffrer le ficihier `vault.yml`. Pour se
faire, il faut lancer la commande suivante :

```bash
  bash scripts/vault/encrypt-vault.sh
```

Le script va utiliser votre clé GPG et probablement vous demander votre passphrase. Il va ensuite chiffrer le
fichier `vault/vault.yml`.

```yaml
$ANSIBLE_VAULT;1.2;AES256
35666561666439633062623165373337393866316362653032656134366565376434383739646163
....
```

Vous devez commiter le fichier chiffré.

### Edition du vault

Si vous voulez éditer le vault, le plus simple est d'utiliser un plugin pour votre IDE

- vscode : [https://marketplace.visualstudio.com/items?itemName=dhoeric.ansible-vault]()
- intellij idea : [https://plugins.jetbrains.com/plugin/14278-ansible-vault-editor]()

Quand vous allez ouvrir le fichier, un mot de passe vous sera demandé. Pour l'obtenir, executez la commande suivante

```bash
  bash scripts/vault/get-vault-password-client.sh
```

Vous pouvez également éditer directement le fichier en ligne de commande sans afficher en clair le mot de passe :

```bash
   EDITOR=vim bash scripts/vault/edit-vault.sh
   ou
   EDITOR="code -w" bash scripts/vault/edit-vault.sh
```

### Variables du vault

Le vault est divisé en plusieurs sections.

Une section `setup` contenant les variables nécessaires à la configuration du cluster et au déploiement de l'application.

Une section `vault` content les variables nécessaire à l'application divisée en section pour chaque environnement.
La sous section `default` contient les variables partagées entre les environnements.

```yaml
setup:
  DOCKER_USERNAME: "username"
vault:
  default:
    APP_VERSION: "1.0.0"
  recette:
    APP_ENV: "recette"
  production:
    APP_ENV: "production"
```

Pour y faire référence dans un fichier il suffit d'utiliser la syntaxe `{{ vault['default'].APP_VERSION }}` ou `{{ setup.APP_VERSION }}`
Pour référencer une variable spécifique à un environnement, il faut utiliser la syntaxe `{{ vault[env_type].APP_ENV }}`
La variable `env_type` qui est définie dans le fichier `env.ini` sera automatiquement valorisée en fonction de
l'environnement cible.

## Habilitations

### Ajout d'un utilisateur

Il est possible d'ajouter ou de supprimer des habilitations en éditant le
fichier `vault/habilitations.yml`. Tous les utilistateurs présents dans ce fichier pourront accéder au vault si une clé GPG est fournie.

Une habilitation doit être de la forme suivante :

```yml
- username: <nom de l'utilisateur sur l'environnement>
  name: <nom de la personne>
  gpg_key: <identifiant de la clé GPG> (optionnel)
  authorized_keys: <Liste des clés SSH> (il est possible de mettre une url github)
```

Une fois le fichier des habilitations mis à jour, vous devez renouveler le vault et relancer la configuration de
l'environnement.

```bash
  bash scripts/vault/renew-vault.sh
```

### Suppression d'un utilisateur

Pour supprimer une personne des habilitations, il faut :

- enlever les informations renseignées à son sujet dans le fichier `vault/habilitations.yml`

Une fois ces fichiers mis à jour, vous devez renouveler le vault et lancer la commande de nettoyage :

```bash
  bash scripts/vault/renew-vault.sh
```
