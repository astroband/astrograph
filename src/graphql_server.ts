import { initGraphqlServer as init } from "./init";

import * as Sentry from "@sentry/node";

import { ApolloServer } from "apollo-server";
import { InMemoryLRUCache } from "apollo-server-caching";
import { GraphQLError } from "graphql";

import {
  BaseHorizonDataSource,
  HorizonOperationsDataSource,
  HorizonPaymentsDataSource,
  HorizonTradesDataSource,
  HorizonTransactionsDataSource
} from "./datasource/horizon";
import schema from "./schema";
import { listenOffers, orderBook } from "./service/dex";
import logger from "./util/logger";
import { BIND_ADDRESS, PORT } from "./util/secrets";
import { listenBaseReserveChange } from "./util/stellar";

const demoQuery = `{
  account(id: "GB6NVEN5HSUBKMYCE5ZOWSK5K23TBWRUQLZY3KNMXUZ3AQ2ESC4MY4AQ") {
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

/* tslint:disable */
type DataSources = {
  operations: HorizonOperationsDataSource;
  payments: HorizonPaymentsDataSource;
  trades: HorizonTradesDataSource;
  transactions: HorizonTransactionsDataSource;
};

export interface IApolloContext {
  orderBook: { load: typeof orderBook.load };
  dataSources: DataSources;
}

// There is the known issue with Apollo Server that datasources
// are not available in the subscription resolver context.
// So we initialize them manually
// (this particular code snippet is taken from
// https://github.com/apollographql/apollo-server/issues/1526#issuecomment-503285841)
// This issue should be fixed in apollo-server v3
const constructDataSourcesForSubscriptions = (context: any) => {
  const initializeDataSource = (dataSourceClass: new () => BaseHorizonDataSource ) => {
    const instance = new dataSourceClass();
    instance.initialize({ context, cache: new InMemoryLRUCache() });
    return instance;
  }

  return {
    operations: initializeDataSource(HorizonOperationsDataSource),
    payments: initializeDataSource(HorizonPaymentsDataSource),
    trades: initializeDataSource(HorizonTradesDataSource),
    transactions: initializeDataSource(HorizonTransactionsDataSource)
  }
}

init().then(() => {
  listenBaseReserveChange();
  listenOffers();

  const server = new ApolloServer({
    schema,
    tracing: true,
    introspection: true,
    playground: process.env.NODE_ENV === "production" ? { endpoint, tabs: [{ endpoint, query: demoQuery }] } : true,
    debug: true,
    context: ({ req, connection }) => {
      // initialize datasources manually only for subscriptions
      if (connection) {
        return {
          orderBook,
          dataSources: constructDataSourcesForSubscriptions(connection.context),
        };
      } else {
        return { orderBook };
      }
    },
    cors: true,
    dataSources: (): DataSources => {
      return {
        operations: new HorizonOperationsDataSource(),
        payments: new HorizonPaymentsDataSource(),
        trades: new HorizonTradesDataSource(),
        transactions: new HorizonTransactionsDataSource()
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

  Sentry.withScope((scope) => {
    scope.setExtra("query", error.source);
    Sentry.captureException(error.originalError || error);
  });
}
