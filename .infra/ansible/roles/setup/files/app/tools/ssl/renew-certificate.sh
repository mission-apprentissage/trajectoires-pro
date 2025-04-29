#!/usr/bin/env bash
set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly DNS_NAME_TEST=${1:?"Merci de préciser au moins un nom de domaine"}
readonly DNS_NAMES=("${@:1}")

start_reverse_proxy() {
  NO_UPDATE=true bash /opt/trajectoires-pro/start-app.sh "$(git --git-dir=/opt/trajectoires-pro/repository/.git rev-parse --abbrev-ref HEAD)" \
    --no-deps reverse_proxy
}

stop_reverse_proxy() {
  bash /opt/trajectoires-pro/stop-app.sh trajectoires_pro_reverse_proxy --no-deps reverse_proxy
}

renew_certificate() {
  cd "${SCRIPT_DIR}"
  docker build --tag trajectoires_pro_certbot certbot/
  docker run --rm --name trajectoires_pro_certbot \
    -p 80:5000 \
    -v /opt/trajectoires-pro/data/certbot:/etc/letsencrypt \
    -v /opt/trajectoires-pro/data/ssl:/ssl \
    trajectoires_pro_certbot renew "${DNS_NAMES[@]}"
  cd -
}

handle_error() {
  bash /opt/trajectoires-pro/tools/send-to-slack.sh "[SSL] Unable to renew certificate"
  start_reverse_proxy
}
trap handle_error ERR

echo "****************************"
echo "[$(date +'%Y-%m-%d_%H%M%S')] Running ${BASH_SOURCE[0]} $*"
echo "****************************"
stop_reverse_proxy
renew_certificate
start_reverse_proxy
bash /opt/trajectoires-pro/tools/send-to-slack.sh "[SSL] Certificat has been renewed"
