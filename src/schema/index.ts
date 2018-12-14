import { makeExecutableSchema, mergeSchemas } from "apollo-server";

import { typeDefs as operationsTypeDefs } from "./operations";
import resolvers from "./resolvers";
import { typeDefs as generalTypeDefs } from "./type_defs";

const schema = makeExecutableSchema({
  typeDefs: [generalTypeDefs, operationsTypeDefs],
  resolverValidationOptions: {
    requireResolversForResolveType: false
  }
});
const schemas = [schema];

export default mergeSchemas({ schemas, resolvers });
