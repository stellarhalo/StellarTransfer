#!/bin/sh
set -eu

if [ "$(id -u)" -ne 0 ]; then
  exec "$@"
fi

PUID="${PUID:-1000}"
PGID="${PGID:-1000}"
APP_GROUP="stellartransfer"
APP_USER="stellartransfer"

if ! getent group "$APP_GROUP" >/dev/null 2>&1; then
  addgroup -g "$PGID" "$APP_GROUP"
fi

if ! id -u "$APP_USER" >/dev/null 2>&1; then
  if ! getent passwd "$PUID" >/dev/null 2>&1; then
    adduser -D -u "$PUID" -G "$APP_GROUP" "$APP_USER" >/dev/null 2>&1
  fi
fi

mkdir -p /opt/app/backend/data /opt/app/frontend/public/img
chown -R "$PUID:$PGID" /opt/app/backend/data /opt/app/frontend/public/img

exec su-exec "$PUID:$PGID" "$@"
