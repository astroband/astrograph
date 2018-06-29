Astrograph
==========

Stellar GraphQL interface.

# Installation

`go get https://github.com/mobius-network/astrograph`

# Usage

`astrograph --database-url=postgres://localhost/core?sslmode=disable`

`open localhost:8000`

# TODO

4. Monitor entity deletion.
1. Fast rewind to last ledger - ?
2. Send updates to all accounts on gap
3. Filter updates by request (do not query accounts which are not currently observed and/or not passed to ctx)
5. Proper error handling
6. extract sqlhooks
