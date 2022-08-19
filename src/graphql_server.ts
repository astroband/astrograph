import { initGraphqlServer as init } from "./init";

import * as Sentry from "@sentry/node";

import { ApolloServer } from "apollo-server";
import { GraphQLError } from "graphql";

import schema from "./schema";
import logger from "./util/logger";

import { listenOffers, orderBook } from "./service/dex";
import { OperationsStorage, TradesStorage, TransactionsStorage } from "./storage";
import { BIND_ADDRESS, PORT, STELLAR_NETWORK } from "./util/secrets";
import { listenBaseReserveChange } from "./util/stellar";

const demoQuery = `{
  account(id: "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H") {
    id
    sequenceNumber
    balances {
      asset {
        issuer {
          id
        }
        code
      }
      balance
      limit
      authorized
    }
    signers {
      signer
      weight
    }
  }
}`;

const endpoint = "/graphql";

export interface IApolloContext {
  orderBook: { load: typeof orderBook.load };
  storage: {
    operations: OperationsStorage;
    trades: TradesStorage;
    transactions: TransactionsStorage;
  };
}

init().then(() => {
  logger.warn(
    `Astrograph will submit transactions to the ${STELLAR_NETWORK.toLowerCase()} network. Set STELLAR_NETWORK env variable to change it. Allowed values are "public" and "testnet"`
  );
  listenBaseReserveChange();
  listenOffers();

  const server = new ApolloServer({
    schema,
    tracing: true,
    introspection: true,
    playground: process.env.NODE_ENV === "production" ? { endpoint, tabs: [{ endpoint, query: demoQuery }] } : true,
    debug: true,
    cors: true,
    context: () => {
      return {
        orderBook,
        storage: {
          operations: new OperationsStorage(),
          trades: new TradesStorage(),
          transactions: new TransactionsStorage()
        }
      };
    },
    formatError: (error: GraphQLError) => {
      logger.error(error);
      reportToSentry(error);

      return new GraphQLError(
        error.message,
        error.nodes,
        error.source,
        error.positions,
        error.path,
        error,
        error.extensions
      );
    }
  });

  server.listen({ port: PORT, host: BIND_ADDRESS }).then(({ url }) => {
    logger.info(`🚀 Server ready at ${url}`);
  });
});

function reportToSentry(error: GraphQLError): void {
  const errorCodesToIgnore = ["BAD_USER_INPUT", "GRAPHQL_VALIDATION_FAILED"];
  const errorCode = error.extensions ? error.extensions.code : null;

  if (errorCode && errorCodesToIgnore.includes(errorCode)) {
    return;
  }

  Sentry.withScope(scope => {
    scope.setExtra("query", error.source);
    Sentry.captureException(error.originalError || error);
  });
}
