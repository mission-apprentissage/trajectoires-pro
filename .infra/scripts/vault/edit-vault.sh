#!/usr/bin/env bash
set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly VAULT_DIR="${SCRIPT_DIR}/../../vault"
readonly VAULT_FILE="${1:-${VAULT_DIR}/vault.yml}"

ansible-vault edit --vault-password-file="${SCRIPT_DIR}/get-vault-password-client.sh" "${VAULT_FILE}"
