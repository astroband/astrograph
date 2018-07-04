#! /usr/bin/env bash
set -o errexit
set -o pipefail

if [[ ! -e "${ASTROGRAPH_CONFIG}" ]]; then
cat <<EOM >${ASTROGRAPH_CONFIG}
--port=${ASTROGRAPH_PORT}
--bind=${ASTROGRAPH_BIND}
--database-url=${ASTROGRAPH_DATABASE_URL}
--ingest-timeout=${ASTROGRAPH_INGEST_TIMEOUT}
EOM
fi

echo $@
cat $ASTROGRAPH_CONFIG

exec "$@"
