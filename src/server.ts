import { ApolloServer } from "apollo-server";

import logger from "./common/util/logger";
import schema from "./schema";
import ingest from "./ingest";

const server = new ApolloServer({
  schema,
  tracing: true
});

ingest.start();

server.listen().then(({ url }) => {
  logger.info(`🚀 Server ready at ${url}`);
});
