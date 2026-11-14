# Monitoring + CircleCI release validation

The API in Docker on your Mac stands in for production. Prometheus watches its
error rate, and Alertmanager sends alerts to CircleCI. After a production
deploy, CircleCI's release validation listens for 10 minutes. A firing
`error_rate` alert fails the release and triggers `.circleci/rollback.yml`.

```
api ──/metrics──▶ Prometheus ──alert──▶ Alertmanager ──webhook──▶ CircleCI release validation ──▶ rollback pipeline
```

## One-time setup

1. **Webhook secret:** CircleCI → Org settings → **Deploys** → Webhook secrets → *Create webhook secret*.
   It's only shown once. Save it locally (it's gitignored):
   ```sh
   pbpaste > monitoring/secrets/circleci-webhook-token
   ```
2. **Org ID:** copy it from Org settings → Overview, then:
   ```sh
   cp monitoring/.env.example monitoring/.env   # set CIRCLECI_ORG_ID
   ```
3. **Rollback pipeline:** Project settings → Project Setup → *Create pipeline definition*
   pointing at `.circleci/rollback.yml`, then select it under Project settings → Deploys → Rollback Pipeline.
4. **Contexts:** `ghcr-publish`, `staging` and `production` must exist (see the main README).

## Start it

```sh
cd monitoring
docker compose up -d --build
```

| URL | What |
|---|---|
| http://localhost:3000/metrics | API metrics |
| http://localhost:9090/alerts | Prometheus alert state |
| http://localhost:9093 | Alertmanager |

## Trigger a rollback

1. Merge to `main`, approve `hold-production`, and let `deploy-production` finish.
   `validate-production` starts a 10-minute evaluation window.
2. Break "production":
   ```sh
   ./chaos.sh 0.5   # fail 50% of API requests
   ```
3. About 45s later the alert fires (`pending` → `firing` at :9090/alerts) and Alertmanager posts it to CircleCI.
   The release should fail and the rollback pipeline should run. Watch **Deploys** in CircleCI.
4. Recover: `./chaos.sh 0`.

Check delivery with `docker compose logs alertmanager`: failed sends show up as `Notify attempt failed`.

To see a release pass validation, deploy and leave `chaos.sh` off for the full 10 minutes.
