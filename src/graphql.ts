import "./util/memo";

import { ApolloServer } from "apollo-server";
import Honeybadger from "honeybadger";

import { Cursor, Worker } from "./ingest";
import schema from "./schema";
import { Connection } from "./storage/connection";
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
  logger.info(`[DGraph] Updating schema...`);
  new Connection().migrate().catch((err: any) => {
    logger.error(err);
    Honeybadger.notify(err);
    process.exit(-1);
  });
}

Cursor.build(DEBUG_LEDGER).then(cursor => {
  logger.info(
    `Staring ingest every ${INGEST_INTERVAL} ms. from ${
      DEBUG_LEDGER === -1 ? "first ledger" : DEBUG_LEDGER || "lastest ledger"
    }`
  );

  const tick = async () => {
    logger.info(`Ingesting ledger ${cursor.current}`);

    const worker = new Worker(cursor);
    worker
      .run()
      .then(done => {
        logger.info(`Ingesting ledger ${cursor.current} finished!`);
        if (done) {
          tick();
        } else {
          setTimeout(tick, INGEST_INTERVAL);
        }
      })
      .catch(e => {
        logger.error(`Error \`${e.message}\` occured`);
        if (e.message.includes("Please retry again, server is not ready to accept requests")) {
          setTimeout(tick, 200);
          return;
        }

        Honeybadger.notify(e);
      });
  };

  tick();
});

server.listen({ port: PORT, host: BIND_ADDRESS }).then(({ url }) => {
  logger.info(`🚀 Server ready at ${url}`);
});
