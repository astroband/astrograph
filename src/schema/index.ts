import { makeExecutableSchema, mergeSchemas } from "apollo-server";

import { typeDefs as horizonTypeDefs } from "./horizon";
import resolvers from "./resolvers";
import { typeDefs as transactionsTypeDefs } from "./transactions";
import { typeDefs } from "./type_defs";

const schema = makeExecutableSchema({
  typeDefs: [typeDefs, horizonTypeDefs, transactionsTypeDefs],
  resolverValidationOptions: { requireResolversForResolveType: false }
});

export default mergeSchemas({ schemas: [schema], resolvers });
