#!/usr/bin/env bash
set -euo pipefail
#Needs to be run as sudo

iptables -D INPUT -m set --match-set ipsum src -j DROP 2>/dev/null || true

bash /opt/trajectoires-pro/tools/send-to-slack.sh "[IPTABLES] IPs blacklist has been cleared."

ipset destroy ipsum
