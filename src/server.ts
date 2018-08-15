import { ApolloServer } from "apollo-server";

import logger from "./common/util/logger";
import schema from "./schema";
import db from "./database";
import { ACCOUNT_CREATED, pubsub } from "./pubsub";

setInterval(async () => {
  pubsub.publish(
    ACCOUNT_CREATED,
    await db.accounts.findByID("GAAAACMYIL3CI3ACP2K2BVD32YCO5E6XI35EO62L2TOMTDO4A4LIIIUF")
  )
},
2000)

const server = new ApolloServer({
  schema,
  tracing: true
});

server.listen().then(({ url }) => {
  logger.info(`🚀 Server ready at ${url}`);
});
