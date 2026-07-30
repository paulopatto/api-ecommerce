#!/bin/sh
set -e

echo "Aguardando dependências e aplicando migrations..."

if [ -n "$DATABASE_URL" ]; then
  npx prisma migrate deploy
else
  echo "DATABASE_URL não definida — pulando migrations"
fi

exec "$@"
