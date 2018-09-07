#! /bin/sh
set -ue

echo "Starting Astrograph..."

if [[ $NODE_ENV = "production" ]]; then
  exec yarn run prod
fi

if [[ $NODE_ENV = "development" ]]; then
  exec yarn run dev
fi
