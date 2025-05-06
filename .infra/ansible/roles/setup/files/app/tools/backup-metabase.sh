#!/usr/bin/env bash
set -euo pipefail
#Needs to be run as sudo

readonly BACKUP_NAS_DIR="/mnt/backups/metabase"
readonly BACKUP_LOCAL_DIR="/opt/trajectoires-pro/backups/metabase"

stop_container() {
  bash /opt/trajectoires-pro/stop-app.sh metabase
}

restart_container() {
  local CURRENT_BRANCH
  CURRENT_BRANCH="$(git --git-dir=/opt/trajectoires-pro/repository/.git rev-parse --abbrev-ref HEAD)"

  NO_UPDATE=true bash /opt/trajectoires-pro/start-app.sh "${CURRENT_BRANCH}" --no-deps metabase
}

function backup() {
  echo "Sauvegarde de la base metabase..."
  mkdir -p "${BACKUP_LOCAL_DIR}"

  stop_container
  tar -zcvf "/opt/trajectoires-pro/backups/metabase/metabase-$(date +'%Y-%m-%d_%H%M%S').tar.gz" \
    -C /opt/trajectoires-pro/data/metabase .
  restart_container

  echo "Sauvegarde terminé."
}

function replicate_backups() {
  echo "Replicating Metabase backups..."
  mkdir -p "${BACKUP_NAS_DIR}"
  rsync -rltzv "${BACKUP_LOCAL_DIR}/" "${BACKUP_NAS_DIR}/"
}

function remove_old_backups() {
  echo "Removing old Metabase backups..."
  find "${BACKUP_LOCAL_DIR}" -mindepth 1 -maxdepth 1 -prune -ctime +7 -exec rm -r "{}" \;
  find "${BACKUP_NAS_DIR}" -mindepth 1 -maxdepth 1 -prune -ctime +30 -exec rm -r "{}" \;
}

echo "****************************"
echo "[$(date +'%Y-%m-%d_%H%M%S')] Running ${BASH_SOURCE[0]} $*"
echo "****************************"
backup
replicate_backups
remove_old_backups
