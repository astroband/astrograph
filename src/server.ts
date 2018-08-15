import { ApolloServer } from "apollo-server";

import logger from "./common/util/logger";
import ingest from "./ingest";
import schema from "./schema";

const server = new ApolloServer({
  schema,
  tracing: true
});

ingest.start();

server.listen().then(({ url }) => {
  logger.info(`🚀 Server ready at ${url}`);
});
