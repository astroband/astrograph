import PostgresPubSub from "@udia/graphql-postgres-subscriptions";
import { Client } from "pg";

import logger from "./common/util/logger";
import db from "./database";

const pgClient = new Client(db.$cn);
const pubSub = new PostgresPubSub(pgClient);

pgClient
  .connect()
  .then(() => logger.debug("Connected to PG pubsub"))
  .catch(err => logger.error(`Error connecting to PG pubsub: ${err}`));

export default pubSub;
