import { ApolloServer } from "apollo-server";

import startIngest from "./common/util/ingest";
import logger from "./common/util/logger";
import { BIND_ADDRESS, PORT } from "./common/util/secrets";
import { setNetwork as setStellarNetwork } from "./common/util/stellar";
import schema from "./schema";

const isDev = process.env.NODE_ENV === "development";

const server = new ApolloServer({
  schema,
  tracing: true,
  introspection: true,
  playground: true,
  mocks: isDev,
  debug: isDev,
  cors: true
});

setStellarNetwork().then((network: string) => {
  logger.info(`Using ${network}`);
});

startIngest();

server.listen({ port: PORT, host: BIND_ADDRESS }).then(({ url }) => {
  logger.info(`🚀 Server ready at ${url}`);
});
