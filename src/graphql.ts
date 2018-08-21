import { ApolloServer } from "apollo-server";

import logger from "./common/util/logger";
import { Ingestor } from "./ingest";
import schema from "./schema";

const server = new ApolloServer({
  schema,
  tracing: true
});

Ingestor.start();

server.listen().then(({ url }) => {
  logger.info(`🚀 Server ready at ${url}`);
});
