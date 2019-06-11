import init from "./init";

import * as Sentry from "@sentry/node";

import { ApolloServer } from "apollo-server";
import { GraphQLError } from "graphql";

import {
  HorizonAssetsDataSource,
  HorizonOperationsDataSource,
  HorizonPaymentsDataSource,
  HorizonTradesDataSource,
  HorizonTransactionsDataSource
} from "./datasource/horizon";
import * as orderBook from "./order_book";
import schema from "./schema";
import logger from "./util/logger";
import { BIND_ADDRESS, PORT } from "./util/secrets";
import { listenBaseReserveChange } from "./util/stellar";

const demoQuery = `{
  account(id: "GB6NVEN5HSUBKMYCE5ZOWSK5K23TBWRUQLZY3KNMXUZ3AQ2ESC4MY4AQ") {
    id
    sequenceNumber
    balances {
      asset {
        native
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
  assets: HorizonAssetsDataSource;
  operations: HorizonOperationsDataSource;
  payments: HorizonPaymentsDataSource;
  trades: HorizonTradesDataSource;
  transactions: HorizonTransactionsDataSource;
};

export interface IApolloContext {
  orderBook: { load: typeof orderBook.load };
  dataSources: DataSources;
}

init().then(() => {
  listenBaseReserveChange();

  const server = new ApolloServer({
    schema,
    tracing: true,
    introspection: true,
    playground: process.env.NODE_ENV === "production" ? { endpoint, tabs: [{ endpoint, query: demoQuery }] } : true,
    debug: true,
    context: () => {
      return { orderBook };
    },
    cors: true,
    dataSources: (): DataSources => {
      return {
        assets: new HorizonAssetsDataSource(),
        operations: new HorizonOperationsDataSource(),
        payments: new HorizonPaymentsDataSource(),
        trades: new HorizonTradesDataSource(),
        transactions: new HorizonTransactionsDataSource()
      };
    },
    formatError: (error: GraphQLError) => {
      logger.error(error);

      if (!error.originalError || error.originalError.constructor.name !== "UserInputError") {
        Sentry.captureException(error);
      }

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
