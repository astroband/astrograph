import { ApolloServer } from "apollo-server";

import startIngest from "./common/util/ingest";
import logger from "./common/util/logger";
import schema from "./schema";
import dgraph from "./dgraph";

const server = new ApolloServer({
  schema,
  tracing: true
});

startIngest();
dgraph.init();

server.listen().then(({ url }) => {
  logger.info(`🚀 Server ready at ${url}`);
});
