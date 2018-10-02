import { ApolloServer } from "apollo-server";

import { Cursor, Worker } from "./ingest";
import schema from "./schema";
import { Connection } from "./storage";
import logger from "./util/logger";
import { BIND_ADDRESS, DEBUG_LEDGER, DGRAPH_URL, INGEST_INTERVAL, PORT } from "./util/secrets";
import { setNetwork as setStellarNetwork } from "./util/stellar";

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

if (DGRAPH_URL) {
  logger.info(`Updating DGraph schema...`);
  new Connection().migrate().catch((err: any) => {
    logger.error(err);
    process.exit(-1);
  });
}

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
