Astrograph
==========

Stellar GraphQL interface.

# Installation

`go get https://github.com/mobius-network/astrograph`

# Usage

`astrograph --database-url=postgres://localhost/core?sslmode=disable`

`open localhost:8000`

# Schema updates

`cd graph && go generate`

# TODO

3. Abstraction over dataloader
2. Data fields in account results + watch
9. QueryAccounts -> * and ordered - ?
3. Fast rewind to last ledger - ?
4. Filter updates by request (do not query accounts which are not currently observed and/or not passed to ctx)
5. Monitor entity deletion.
6. Proper error handling
