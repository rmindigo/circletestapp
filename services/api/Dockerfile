# Build from repo root: docker build -f services/api/Dockerfile .
FROM node:22-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY services/api/package.json services/api/
RUN npm ci -w services/api --include-workspace-root=false
COPY services/api services/api
RUN npm run build -w services/api

FROM node:22-alpine
WORKDIR /repo
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY services/api/package.json services/api/
RUN npm ci -w services/api --omit=dev --include-workspace-root=false && npm cache clean --force
COPY --from=build /repo/services/api/dist services/api/dist
ARG APP_VERSION=dev
ENV APP_VERSION=$APP_VERSION
USER node
EXPOSE 3000
CMD ["node", "services/api/dist/server.js"]
