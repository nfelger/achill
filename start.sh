#!/bin/sh
set -euf

# Exporting only if not already set, see https://stackoverflow.com/a/11686912
export NOCODB_AUTH_TOKEN="${NOCODB_AUTH_TOKEN:=$(cat /etc/nocodb-credentials/authToken)}"
export NOCODB_BASE_URL="${NOCODB_BASE_URL:=$(cat /etc/nocodb-credentials/baseUrl)}"
export SESSION_COOKIE_SECRET="${SESSION_COOKIE_SECRET:=$(cat /etc/session-cookie-secret/secret)}"
export PERSONIO_CLIENT_ID="${PERSONIO_CLIENT_ID:=$(cat /etc/personio-credentials/client_id)}"
export PERSONIO_CLIENT_SECRET="${PERSONIO_CLIENT_SECRET:=$(cat /etc/personio-credentials/client_secret)}"

npm run start
