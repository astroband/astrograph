import { ApolloServer } from "apollo-server";
import { Network } from "stellar-base";
import db from "./database";

import startIngest from "./common/util/ingest";
import logger from "./common/util/logger";
import schema from "./schema";

const server = new ApolloServer({
  schema,
  tracing: true
});

db.one("SELECT state FROM storestate WHERE statename = 'networkpassphrase'").then(({ state: networkPassphrase }) => {
  logger.info(`Using ${networkPassphrase}`);
  Network.use(new Network(networkPassphrase));
});

startIngest();

server.listen().then(({ url }) => {
  logger.info(`🚀 Server ready at ${url}`);
});
