# Monitoring

Le monitoring de l'infrastructure et de l'application se fait via l'interface de Grafana.
Vous pouvez la retrouver via la variable [`monitoring_host`](/.infra/env.ini)

## Alertes

Des alertes sont préconfigurées et sont envoyées sur Slack sur le channel [`slack_channel`](/.infra/env.ini) configuré à la configuration du cluster.
