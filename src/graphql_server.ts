import init from "./init";

import * as Sentry from "@sentry/node";

import { ApolloServer } from "apollo-server";
import { GraphQLError } from "graphql";

import { ElasticOperationsDataSource } from "./datasource/elastic/operations";
import {
  HorizonAssetsDataSource,
  HorizonEffectsDataSource,
  HorizonOrderBookDataSource,
  HorizonPaymentsDataSource,
  HorizonTradesDataSource,
  HorizonTransactionsDataSource
} from "./datasource/horizon";
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
  effects: HorizonEffectsDataSource;
  operations: ElasticOperationsDataSource;
  orderBook: HorizonOrderBookDataSource;
  payments: HorizonPaymentsDataSource;
  trades: HorizonTradesDataSource;
  transactions: HorizonTransactionsDataSource;
};

export interface IApolloContext {
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
    cors: true,
    dataSources: (): DataSources => {
      return {
        assets: new HorizonAssetsDataSource(),
        effects: new HorizonEffectsDataSource(),
        operations: new ElasticOperationsDataSource(),
        orderBook: new HorizonOrderBookDataSource(),
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
