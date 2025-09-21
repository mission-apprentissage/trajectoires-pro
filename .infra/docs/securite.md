# Securité

## Secrets

Les secrets ne **doivent** jamais etre commit en clair dans le repository. Dans le cas, où cela arriverait veuillez en informer l'équipe dans les plus brefs délais.

Les secrets sont chiffré via GPG, et stockés dans le vault. Veuillez consulter la doc [Gestion des secrets](vault.md)

## Cluster Kubernetes

### Private network

Les noeuds du cluster utilisent un réseau privé, ils sont uniquement accessibles via :

- Un noeud du cluster
- La console Kubernetes (kubectl)
- Le loadbalancer en passant par l'ingress

### OWASP ModSecurity

La cluster utilise un ingress Nginx avec ModSecurity et les règles OWASP ModSecurity Core Rule Set (CRS).

Ces règles peuvent rentrer en conflit avec l'application, certaines sont donc désactivées. Vous pouvez modifier les règles dans le [fichier de création de l'ingress](/.infra/terraform/ingress.tf)

### IP Blacklist

L'ingress nginx contient une [configuration](/.infra/terraform/security.tf) qui permet de bloquer une liste d'IPs malveillantes.
Cette liste provient de [IPsum](https://github.com/stamparm/ipsum) et est mise à jour quotidiennement.
