[![Build Status](https://img.shields.io/travis/com/astroband/astrograph/master.svg)](https://travis-ci.com/astroband/astrograph)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=astroband_astrograph&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=astroband_astrograph)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=astroband_astrograph&metric=security_rating)](https://sonarcloud.io/dashboard?id=astroband_astrograph)
[![License](https://img.shields.io/github/license/astroband/astrograph.svg)](raw/master/LICENSE.txt)

# Astrograph

<img align="right" width="150" height="150"
     alt="Graph of stars reflected in telescope lens, logo of Astrograph"
     src="https://astrograph.io/logo.svg">

**Important** This project is still under heavy active development. Until it reaches 1.0 breaking changes may land without prior notice.

Astrograph is a GraphQL server for the [Stellar](https://www.stellar.org/) network. You can think about it as a GraphQL version of [Horizon](https://github.com/stellar/go/tree/master/services/horizon), the client-facing API server for the Stellar ecosystem. 

Astrograph allows you to retrieve various data from the blockchain, as well as allowing you to subscribe to particular events using [GraphQL subscriptions](https://github.com/apollographql/graphql-subscriptions) mechanisms.

Astrograph was initially developed by Evil Martians for [Mobius](https://mobius.network) under the MIT license. We continue our work on Astrograph for the benefit of the broader Stellar developer community. Anyone is welcome to contribute to Astrograph, just read [CONTRIBUTING.md](.github/CONTRIBUTING.md).

<a href="https://evilmartians.com/?utm_source=astrograph">
<img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg" alt="Sponsored by Evil Martians" width="236" height="54"></a>

## Install

You can install Astrograph, using [yarn](https://yarnpkg.com/):

```shell
$ git clone https://github.com/astroband/astrograph
$ cd astrograph
$ yarn                        # install dependencies
$ yarn run dev                # for developing purposes
$ yarn run prod               # for live setup
$ yarn ts-node src/ingestd.ts # live ingesting for subscriptions
``` 

## Configure

Here is the list of available settings:

* `STELLAR_NETWORK` – which Stellar network to use ("pubnet" or "testnet", "pubnet" by default)
* `DB` – stellar-core database name ("stellar" by default)
* `DBPORT` – database port to connect to (5432 by default)
* `DBHOST` – database host to connect to
* `DBUSER` – database user to connect with ("stellar" by default)
* `DBPASSWORD` – password to access the database (no password by default)
* `PORT` - port (4000 by default)
* `BIND_ADDRESS` - address to bind ("0.0.0.0" by default)
* `INGEST_INTERVAL` – database polling interval in milliseconds (2000 by default)
* `DEBUG_LEDGER` – when set, Astrograph will start ingesting ledgers, starting from that. It's useful for debugging. Pass `-1` to force ingest from first ledger existing in database.
* `DEBUG_SQL` - when set, log sql queries.
* `SENTRY_DSN` - DSN string for integration with [Sentry](https://sentry.io)

You can set them all using environmental variables, or you can create the `.env` file in the root of the project, and set them there:

```
DB="stellar_core"
DBUSER="john"
...
```

## Develop

In order to develop locally, you need to get the stellar-core database. The easiest way to get it is to run stellar-core node in docker (check [docker-stellar-core](https://github.com/mobius-network/docker-stellar-core)) and let it ingest some ledgers.

After `yarn run dev` [GraphQL playground](https://www.npmjs.com/package/graphql-playground) will be available on `http://localhost:4000`

Also, in order for subscriptions to work, live ingesting should be started. You can start it with `yarn ts-node src/ingestd.ts` command.

### Testing

Astrograph uses [jest](https://github.com/facebook/jest) for the tests.

You can run all available tests with `yarn run test` command.

Astrograph ships with integration tests too.
You should configure test database connection with `.env.test` file before running them because they are using [database fixture](tests/test_db.sql).
`.env.test` file presence is mandatory to prevent accidental overwriting your stellar-core database with the fixture!

You can run unit and integration tests separately, using the next commands:

```
yarn run test:unit
yarn run test:integration
```

## Usage

Let's go straight to some example queries:

### Getting account info

```graphql
query {
  account(id: "GBSTRUSD7IRX73RQZBL3RQUH6KS3O4NYFY3QCALDLZD77XMZOPWAVTUK") {
    id
    inflationDestination { id }
    sequenceNumber
    balances {
      asset {
        code
        native
        issuer { id }
      }
      balance
      limit
    }
    data {
      name
      value
    }
    signers {
      signer
    }
    ledger {
      seq
      header {
        ledgerVersion
      }
    }
    flags {
      authRequired
      authRevocable
      authImmutable
    }
    thresholds {
      masterWeight
      low
      medium
      high
    }
  }
}
```

There is also a corresponding query for multiple accounts:

```graphql
query {
  accounts(id: [
    "GCCD6AJOYZCUAQLX32ZJF2MKFFAUJ53PVCFQI3RHWKL3V47QYE2BNAUT",
    "GBSTRUSD7IRX73RQZBL3RQUH6KS3O4NYFY3QCALDLZD77XMZOPWAVTUK"
  ]) {
    # ...
  }
}
```

*NOTE*: Please note that native balance is returned inside a trustline too, and is marked with the boolean flag.

## Subscriptions

The most exciting and powerful feature of Astrograph is subscriptions.

Generally, you can subscribe to the next events: `CREATE`, `UPDATE` and `REMOVE`. To subscribe individually to events you need, you can use the next filters:

* `mutationType[]` – event type(s) to subscribe to.
* `idEq` and `idIn[]` – stellar account public address you're interested in

The typical published event contains the next attributes:

* `mutationType` – event type
* `values` holds new values for changed entity. It is `null` for the `REMOVE` events.
* Key fields: `id` for account, `account` + `asset` for trust line, etc.

Here are some examples:

### Awaiting for missing account to be created

```graphql
subscription {
  account(args: {
    idEq: "GAK3NSB43EVCZKDH4PYGJPCVPOYZ7X7KIR3ZTWSYRKRMJWGG5TABM6TH",
    mutationTypeIn: [CREATE]
  }) {
   	id
    mutationType
    values {
      homeDomain
      thresholds {
        low
        medium
        high
        masterWeight
      }
    }
  }
}
```

### Monitoring account balance

```graphql
subscription {
  balance(args: {
    idEq: "GCCD6AJOYZCUAQLX32ZJF2MKFFAUJ53PVCFQI3RHWKL3V47QYE2BNAUT",
    mutationTypeIn: [UPDATE]
  }) {
    mutationType
    account { id }
    values {
      asset {
        code
        issuer { id }
        native
      }
      balance
    }
  }
}
```

Check out the [examples](examples) folder for more!


## Console

To show all account trust lines:

```shell
$ yarn ts-node examples/balance-cli.ts GA4DMQ3VSHIVROQ42PJVJOD7X4PYT5BXAWV672CAWOWIADXC3RGZEOMZ
```

To monitor account trust line changes:

```shell
$ yarn ts-node examples/balance-monitor-cli.ts GA4DMQ3VSHIVROQ42PJVJOD7X4PYT5BXAWV672CAWOWIADXC3RGZEOMZ
```

All examples are assuming that Astrograph is running on `localhost:4000`. You can pass URL as a second parameter.

## Benchmark

We haven't done full stress tests yet. Despite that, it looks like the server on MBP mid 14 with 16GB RAM survives approx 7k concurrent connections with no losses. Check the [benchmark script](benchmark/index.ts) for details. To implement the fully functional test, we need to implement a dedicated stress test mode.

## Maintainers

* Victor Sokolov (@gzigzigzeo)
* Timur Ramazanov (@charlie-wasp)
* Sergey Nebolsin (@nebolsin)

## License

The project is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT)

Parts of the path finding engine include the original code from [stellar-pathfinder-server](https://github.com/future-tense/stellar-pathfinder-server)
project created by [Johan Stén](https://github.com/johansten]) and [Future Tense, LLC](https://github.com/future-tense),
adapted and modified by Astrograph project team.
