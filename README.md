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

### Docker compose

So the most simple way to launch Astrograph to try it out is with `docker-compose`:

```shell
# For the pubnet
docker-compose -f docker_compose/docker-compose.pubnet.yaml up -d
# wait a little for the stellar-core and postgres to start up and then run the next command
# to to enhance core database for the Astrograph needs
docker exec -it astrograph-stellar-core-postgres-pubnet psql -U stellar -d stellar -f /init.sql

# For the testnet
docker-compose -f docker_compose/docker-compose.testnet.yaml up -d
# wait a little for the stellar-core and postgres to start up and then run the next command
# to to enhance core database for the Astrograph needs
docker exec -it astrograph-stellar-core-postgres-testnet psql -U stellar -d stellar -f /init.sql
```

Containers created with these commands export the next ports you can access:

* Astrograph GraphQL sandbox -- `4000`(pubnet) and `5000`(testnet)
* Stellar core HTTP ports -- `11625` and `11626`(pubnet), `12625` and `12626`(testnet)
* Elasticsearch HTTP endpoint -- `9200` (pubnet) and `9300` (testnet)

We chose such port mapping to allow both pubnet and testnet instances to run simultaneously

To test that Astrograph was setup correctly, visit GraphQL sandbox (http://localhost:4000 for pubnet and http://localhost:5000 for testnet), and
try to subscribe to new ledgers:

```graphql
subscription {
  ledgerCreated {
    seq
  }
}
```

You should see new ledgers coming. Remember that you should wait for stellar-core to start applying ledgers, so monitor it with stellar-core `info` HTTP-command
(e.g., like this: `curl localhost:11626/info` for pubnet and `curl localhost:12626/info` for testnet, you need `state` attribute) before running the test above.

## Develop

For the developing purposes you can setup Astrograph as a standalone js-application:

```shell
$ git clone https://github.com/astroband/astrograph
$ cd astrograph
$ yarn                        # install dependencies
$ yarn run dev                # for developing purposes
$ yarn run prod               # for live setup
$ yarn ts-node src/ingestd.ts # live ingesting for subscriptions
``` 

Create assets view in database:

```
CREATE VIEW assets AS
( SELECT (t.assetcode::text || '-'::text) || t.issuer::text AS id,
    t.assetcode AS code,
    t.issuer,
    a.flags,
    sum(t.balance) AS "totalSupply",
    sum(t.balance) FILTER (WHERE t.flags = 1) AS "circulatingSupply",
    count(t.accountid) AS "holdersCount",
    count(t.accountid) FILTER (WHERE t.flags = 0) AS "unauthorizedHoldersCount",
    max(t.lastmodified) AS "lastActivity"
   FROM trustlines t JOIN accounts a ON t.issuer::text = a.accountid::text
  GROUP BY t.issuer, t.assetcode, a.flags
  ORDER BY (count(t.accountid)) DESC)
UNION
 SELECT 'native'::text AS id,
    'XLM'::character varying AS code,
    NULL::character varying AS issuer,
    4 AS flags,
    sum(accounts.balance) AS "totalSupply",
    sum(accounts.balance) AS "circulatingSupply",
    count(*) AS "holdersCount",
    0 AS "unauthorizedHoldersCount",
    max(accounts.lastmodified) AS "lastActivity"
   FROM accounts;
```

## Configure

Here is the list of available settings:

* `STELLAR_NETWORK` – which Stellar network to use. You can use "pubnet"(default) or "testnet" shortcuts, any other value will be used as a network passphrase
* `DATABASE_URL` – database connection URL
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
        id
        code
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
        id
        code
        issuer { id }
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
