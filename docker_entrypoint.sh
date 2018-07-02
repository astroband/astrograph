#! /usr/bin/env bash
set -o errexit
set -o pipefail

cat <<EOM >/root/.astrograph_cmd
--port=${ASTROGRAPH_PORT}
--bind=${ASTROGRAPH_BIND}
--database-url=${ASTROGRAPH_DATABASE_URL}
--ingest-timeout=${ASTROGRAPH_INGEST_TIMEOUT}
EOM

exec "$@"
