#!/usr/bin/env bash
set -euo pipefail
#Needs to be run as sudo

bash /opt/trajectoires-pro/tools/backup-mongodb.sh
bash /opt/trajectoires-pro/cli.sh migrate
