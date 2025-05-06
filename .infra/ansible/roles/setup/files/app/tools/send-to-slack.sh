#!/usr/bin/env bash
set -euo pipefail

readonly TEXT_MESSAGE=${1:?"Please provide a text message"}
readonly PRIORITY=${2:-"high"}
readonly SLACK_OAUTH="{{ vault.TRAJECTOIRES_PRO_SLACK_OAUTH }}"
readonly MNA_ENV=$(cat /env)
[ $PRIORITY == "low" ] && readonly CHANNEL_NAME="#exposition-ij-alerting-low" || readonly CHANNEL_NAME="#exposition-ij-alerting"

curl -s -o /dev/null -X POST \
  -H "Authorization: Bearer ${SLACK_OAUTH}" \
  -H "Content-type: application/json; charset=utf-8" \
  -d "{\"text\": \"[${MNA_ENV}] ${TEXT_MESSAGE}\", \"channel\": \"${CHANNEL_NAME}\"}" "https://slack.com/api/chat.postMessage"
