# Node 20 conforme .nvmrc (20.20.0)
FROM node:20.20.0-alpine

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat wget

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci \
  && DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build?schema=public" npx prisma generate \
  && npm prune --omit=dev \
  && npm install prisma@7.1.0 --omit=dev --no-fund --no-audit

COPY src ./src
COPY swagger.yaml ./swagger.yaml
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
  && mkdir -p logs

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "src/server.js"]
