#! /usr/bin/env bash
docker pull dgraph/dgraph
mkdir -p /tmp/dgraph
docker-compose -f dgraph/docker-compose.yml up
