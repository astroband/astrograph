import "./init";
import "./util/memo";

import * as Sentry from "@sentry/node";

import { ApolloError, ApolloServer } from "apollo-server";
import { GraphQLError } from "graphql";

import schema from "./schema";
import logger from "./util/logger";
import { BIND_ADDRESS, PORT } from "./util/secrets";

const server = new ApolloServer({
  schema,
  tracing: true,
  introspection: true,
  playground: true,
  debug: true,
  cors: true,
  formatError: (error: ApolloError) => {
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
