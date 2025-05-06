#!/usr/bin/env bash
set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -f "/opt/trajectoires-pro/data/ssl/privkey.pem" ]; then
  cd "${SCRIPT_DIR}"
    docker build --tag trajectoires_pro_certbot certbot/
    docker run --rm --name trajectoires_pro_certbot \
      -p 80:5000 \
      -v /opt/trajectoires-pro/data/certbot:/etc/letsencrypt \
      -v /opt/trajectoires-pro/data/ssl:/ssl \
      trajectoires_pro_certbot generate "$@"
  cd -
else
  echo "Certificat SSL déja généré"
fi
