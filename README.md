Astrograph
==========

Stellar GraphQL interface.

# Installation

  go get https://github.com/mobius-network/Astrograph

# Usage

  astrograph --database-url=postgres://localhost/core?sslmode=disable

# TODO

1. `--debug`
2. Fast rewind to last ledger
3. Data fields loading/monitoring.
4. SQL logging.
5. Solve N+1 for trustlines.
6. Filter updates by request (do not query accounts which are not currently observed and/or not passed to ctx)
7. Monitor account deletion.
8. Lock gqlgen
