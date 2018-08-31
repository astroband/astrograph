import { ApolloServer } from "apollo-server";

import startIngest from "./common/util/ingest";
import logger from "./common/util/logger";
import { setNetwork as setStellarNetwork } from "./common/util/stellar";
import schema from "./schema";

const server = new ApolloServer({
  schema,
  tracing: true
});

setStellarNetwork().then((network: string) => {
  logger.info(`Using ${network}`);
});

startIngest();

server.listen().then(({ url }) => {
  logger.info(`🚀 Server ready at ${url}`);
});
