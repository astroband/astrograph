Stellar GraphQL Server
======================

# Installation

`git clone https://github.com/mobius-network/astrograph && cd astrograph && yarn`

# Running

`yarn run dev`

# Env vars

* `DB`
* `DBPORT`
* `DBHOST`
* `DBUSER`
* `DBPASSWORD`
* `DEBUG_LEDGER` - start ingest from specific ledger (debug purposes).
* `INGEST_INTERVAL` - poll db every ms (2000 by default), useful while debugging.

TODO:
1. Balance & tlimit calculation (+ long package).
