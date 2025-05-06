#!/usr/bin/env bash
set -euo pipefail

readonly PROJECT_DIR="/opt/trajectoires-pro"
readonly REPO_DIR="/opt/trajectoires-pro/repository"
readonly HOSTNAME=${1:?"Merci de préciser le hostname l'API"}
readonly URL="https://${HOSTNAME}/api/"
shift

function reload_containers() {
  cd "${REPO_DIR}"

  echo "Restarting application..."
  NO_UPDATE=true bash "${PROJECT_DIR}/start-app.sh" "$(git --git-dir=${REPO_DIR}/.git rev-parse --abbrev-ref HEAD)"
  bash "${PROJECT_DIR}/tools/send-to-slack.sh" "Application has been restarted on $(cat /env)"
  cd - >/dev/null
}

function verify_app() {
  for i in 1 2 3 4 5; do
    if wget --timeout 15 -O - -q -t 1 ${URL} |
      jq --exit-status '.healthcheck.mongodb == true' >/dev/null; then
      return 0
    fi
    sleep 30
  done

  false
}

if verify_app; then
  true
else
  echo "****************************"
  echo "[$(date +'%Y-%m-%d_%H%M%S')][ERROR][$(cat /env)] Application on ${URL} is down! Trying to restart..."
  echo "****************************"
  bash "${PROJECT_DIR}/tools/send-to-slack.sh" "[ERROR][$(cat /env)] Application on ${URL} is down! Trying to restart..."
  reload_containers
fi
