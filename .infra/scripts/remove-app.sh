#!/usr/bin/env bash
set -euo pipefail

readonly BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../.."
readonly INFRA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."
readonly VAULT_DIR="${INFRA_DIR}/vault"
readonly VAULT_FILE="${VAULT_DIR}/vault.yml"
readonly ANSIBLE_DIR="${INFRA_DIR}/ansible"
readonly ENV_FILTER=${1:?"Merci de préciser un environnement (ex. dev, recette ou production)"}
readonly APP_VERSION=${2:?"Merci de préciser une version (utiliser pour le tag de l'image docker, le namespace k8s)"}
readonly VAULT_PASSWORD_FILE=${VAULT_PASSWORD_FILE:="${INFRA_DIR}/scripts/vault/get-vault-password-client.sh"}

shift 2


echo "Suppression des images Docker et du déploiement pour ${APP_VERSION} dans l'environnement ${ENV_FILTER}..."
ansible-galaxy collection install community.general
ansible-galaxy collection install community.docker
ansible-galaxy collection install kubernetes.core
ansible-playbook -i "${INFRA_DIR}/env.ini" --extra-vars "@${VAULT_FILE}" \
    --vault-password-file="${VAULT_PASSWORD_FILE}" \
    -e "BASE_DIR=${BASE_DIR}" -e "INFRA_DIR=${INFRA_DIR}" \
    -e "APP_VERSION=${APP_VERSION}" -e "ENV=${ENV_FILTER}" \
    --limit "${ENV_FILTER}" "${ANSIBLE_DIR}/clean.yml" "$@"
