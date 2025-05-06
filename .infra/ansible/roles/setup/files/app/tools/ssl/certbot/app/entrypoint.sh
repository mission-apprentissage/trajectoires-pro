#!/bin/bash
set -euo

readonly SSL_OUTPUT_DIR="/ssl"

if [ ! -d "${SSL_OUTPUT_DIR}" ]; then
  echo "You must mount directory on path ${SSL_OUTPUT_DIR}"
  exit 1
fi

function start_http_server_for_acme_challenge() {
  mkdir -p /var/www
  serve -l 5000 /var/www &
}

function generate_certificate() {
  local dns_name="${1}"
  local dns_names=("${@:1}")
  local arguments=()

  for domain in "${dns_names[@]}"; do 
    arguments+=( "--domain" )
    arguments+=( "$domain" )
  done

  echo "Generating certificate for domain ${dns_names}..."
  certbot certonly \
    --email misson.apprentissage.devops@gmail.com \
    --agree-tos \
    --non-interactive \
    --webroot \
    --webroot-path /var/www \
    --expand \
    "${arguments[@]}"

  cp "/etc/letsencrypt/live/${dns_name}/fullchain.pem" "${SSL_OUTPUT_DIR}"
  cp "/etc/letsencrypt/live/${dns_name}/privkey.pem" "${SSL_OUTPUT_DIR}"
}

function generate_self_signed_certificate() {
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "${SSL_OUTPUT_DIR}/privkey.pem" \
    -out "${SSL_OUTPUT_DIR}/fullchain.pem" \
    -subj "/C=FR/O=Mission Apprentissage/CN=Root"
}

function renew_certificate() {
  local first_dns_name="${1}"

  cp -R "${SSL_OUTPUT_DIR}" "/etc/letsencrypt/live/${first_dns_name}"

  echo "Renewing certificate for domain ${@}..."
  certbot renew

  cp "/etc/letsencrypt/live/${first_dns_name}/fullchain.pem" "${SSL_OUTPUT_DIR}"
  cp "/etc/letsencrypt/live/${first_dns_name}/privkey.pem" "${SSL_OUTPUT_DIR}"
}

function main() {

  local task="${1}"
  local dns_name="${2:?"Please provide a dns name"}"
  local dns_names=("${@:2}")

  case "${task}" in
  generate)
    if [ "${dns_name}" == "localhost" ]; then
      generate_self_signed_certificate
    else
      start_http_server_for_acme_challenge
      generate_certificate "${dns_names[@]}"
    fi
    ;;
  renew)
    start_http_server_for_acme_challenge
    renew_certificate "${dns_name[@]}"
    ;;
  *)
    echo "Unknown task '${task}'"
    usage
    exit 1
    ;;
  esac
}

main "$@"
