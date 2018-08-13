import { ApolloServer } from "apollo-server";

import logger from "./common/util/logger";
import schema from "./schema";

const server = new ApolloServer({
  schema,
  tracing: true
});

server.listen().then(({ url }) => {
  logger.info(`🚀 Server ready at ${url}`);
});
