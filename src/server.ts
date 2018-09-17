import { ApolloServer } from "apollo-server";

import startIngest from "./common/util/ingest";
import logger from "./common/util/logger";
import { setNetwork as setStellarNetwork } from "./common/util/stellar";
import schema from "./schema";
import dgraph from "./dgraph";

const server = new ApolloServer({
  schema,
  tracing: true,
  debug: true,
  cors: true
});

setStellarNetwork().then((network: string) => {
  logger.info(`Using ${network}`);
});

startIngest();
dgraph.init();

server.listen().then(({ url }) => {
  logger.info(`🚀 Server ready at ${url}`);
});
