#!/bin/sh
set -eu

if [ -d /tmp/stellartransfer-img ]; then
  cp -rn /tmp/stellartransfer-img/. /opt/app/frontend/public/img/
fi

if [ "${CADDY_DISABLED:-false}" != "true" ]; then
  echo "Starting Caddy reverse proxy..."
  if [ "${TRUST_PROXY:-false}" = "true" ]; then
    caddy start --adapter caddyfile --config /opt/app/reverse-proxy/Caddyfile.trust-proxy
  else
    caddy start --adapter caddyfile --config /opt/app/reverse-proxy/Caddyfile
  fi
else
  echo "Caddy reverse proxy disabled; backend is available on BACKEND_PORT only."
fi

echo "Running database migrations..."
cd /opt/app/backend
npx prisma migrate deploy || echo "WARNING: Migration failed, continuing anyway..."

echo "Starting StellarTransfer frontend..."
PORT="${PORT:-3333}" HOSTNAME="${HOSTNAME:-0.0.0.0}" node /opt/app/frontend/server.js &
FRONTEND_PID="$!"

echo "Starting StellarTransfer backend..."
npm run prod &
BACKEND_PID="$!"

shutdown() {
  kill "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true
  wait "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true
}

trap shutdown INT TERM
wait -n "$FRONTEND_PID" "$BACKEND_PID"
shutdown
