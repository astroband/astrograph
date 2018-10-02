import { ApolloServer } from "apollo-server";

import logger from "./common/logger";
import { BIND_ADDRESS, DEBUG_LEDGER, INGEST_INTERVAL, PORT } from "./common/secrets";
import { setNetwork as setStellarNetwork } from "./common/util/stellar";
import { Cursor, Worker } from "./ingest";
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

Cursor.build(DEBUG_LEDGER).then(cursor => {
  logger.info(
    `Staring ingest every ${INGEST_INTERVAL} ms. from ${
      DEBUG_LEDGER === -1 ? "first ledger" : DEBUG_LEDGER || "lastest ledger"
    }`
  );

  const tick = () => {
    logger.info(`Ingesting ledger ${cursor.current}`);
    new Worker(cursor).run();
  };

  setInterval(tick, INGEST_INTERVAL);
});

server.listen({ port: PORT, host: BIND_ADDRESS }).then(({ url }) => {
  logger.info(`🚀 Server ready at ${url}`);
});
