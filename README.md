Stellar GraphQL Server
======================

# Installation

`git clone https://github.com/mobius-network/astrograph && cd astrograph && yarn`

# Running

`yarn run dev` or `yarn run prod`

# Usage

Open `http://localhost:4000` or use any GraphQL client. Schema is available in [type_defs.ts](src/schema/type_defs.ts).

# Env vars

Stellar Core Database:

* `DB`
* `DBPORT`
* `DBHOST`
* `DBUSER`
* `DBPASSWORD`

Settings:

* `DEBUG_LEDGER` - start ingest from specific ledger (debug purposes).
* `INGEST_INTERVAL` - poll db every ms (2000 by default), useful while debugging.

# Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/mobius-network/astrograph. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.

# License

The project is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
