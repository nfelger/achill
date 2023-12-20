#!/bin/sh
set -euf

# Exporting only if not already set, see https://stackoverflow.com/a/11686912
export NOCODB_AUTH_TOKEN="${NOCODB_AUTH_TOKEN:=$(cat /etc/nocodb-credentials/authToken)}"
export NOCODB_BASE_URL="${NOCODB_BASE_URL:=$(cat /etc/nocodb-credentials/baseUrl)}"

npm run start
