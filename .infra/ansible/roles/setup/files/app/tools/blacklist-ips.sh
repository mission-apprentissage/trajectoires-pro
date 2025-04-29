#!/usr/bin/env bash
# Blacklist list of bad/dangerous IPs
# Daily feed from : https://github.com/stamparm/ipsum
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
set -euo pipefail
#Needs to be run as sudo

ipset -exist create ipsum hash:net
ipset flush ipsum
for ip in $(curl --compressed https://raw.githubusercontent.com/stamparm/ipsum/master/ipsum.txt 2>/dev/null | grep -v "#" | grep -v -E "\s[1-2]$" | cut -f 1); do ipset add ipsum $ip; done
iptables -D INPUT -m set --match-set ipsum src -j DROP 2>/dev/null || true
iptables -I INPUT -m set --match-set ipsum src -j DROP

bash /opt/trajectoires-pro/tools/send-to-slack.sh "[IPTABLES] IPs blacklist has been renewed." "low"
