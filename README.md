# circletestapp

A small monorepo set up the way an enterprise would run it on CircleCI + GitHub.

| Path | What |
|---|---|
| `services/api` | Express + TypeScript task API, shipped as a Docker image |
| `apps/web` | React + Vite frontend |
| `e2e` | Playwright end-to-end tests against the built API and web app |
| `.circleci/config.yml` | Setup workflow: path filtering decides what to build |
| `.circleci/continue_config.yml` | The real pipelines for each part of the repo |

## Local dev

```sh
npm install
npm run dev:api   # http://localhost:3000
npm run dev:web   # http://localhost:5173 (proxies /api to the API)
npm test          # unit + integration tests
npm run test:e2e  # Playwright E2E (builds and starts both apps)
```

## Pipeline

- **Dynamic config / path filtering:** a change under `services/api/` runs only the `api` workflow, and a change under `apps/web/` runs only `web`. Changing the lockfile or `.circleci/` runs both.
- **Test splitting:** API tests run on 2 parallel containers, split by timing data taken from the JUnit results.
- **Test insights:** JUnit results are uploaded through `store_test_results`.
- **E2E:** Playwright runs in full Chromium against production builds of both apps, split across 2 containers. Any API, web or e2e change triggers it. The HTML report, plus traces, screenshots and videos from failed tests, are saved as artifacts.
- **Docker:** the API image is built and smoke-tested on every branch, and pushed to GHCR only from `main`.
- **Deploy:** `main` deploys to staging, waits for a manual `hold-production` approval, then deploys to production.
- **Contexts:** `ghcr-publish`, `staging` and `production` hold the secrets, so none are in the repo.

## Required CircleCI contexts

| Context | Env vars |
|---|---|
| `ghcr-publish` | `GHCR_USER`, `GHCR_TOKEN` (a GitHub PAT with `write:packages`) |
| `staging` | `DEPLOY_TARGET` |
| `production` | `DEPLOY_TARGET` |
