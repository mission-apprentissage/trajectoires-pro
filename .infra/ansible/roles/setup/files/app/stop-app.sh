#!/usr/bin/env bash
set -euo pipefail
#Needs to be run as sudo
readonly CONTAINER_FILTER=${1:-"trajectoires_pro*"};

echo "****************************"
echo "[$(date +'%Y-%m-%d_%H%M%S')] Running ${BASH_SOURCE[0]} $*"
echo "****************************"

echo "Arrêt des conteneurs ${CONTAINER_FILTER}..."
docker container stop $(docker container ls -q --filter name="${CONTAINER_FILTER}") || true
