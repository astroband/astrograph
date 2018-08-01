import { ApolloServer, mergeSchemas } from "apollo-server";
import { GraphQLSchema } from "graphql";

import logger from "./common/util/logger";

import resolvers from "./resolvers";
import schemas from "./schema";

const schema: GraphQLSchema = mergeSchemas({
  schemas,
  resolvers
});

// GraphQL
const server = new ApolloServer({
  schema,
  tracing: true
});

server.listen().then(({ url }) => {
  logger.info(`🚀 Server ready at ${url}`);
});
