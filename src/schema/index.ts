import { addMockFunctionsToSchema, makeExecutableSchema, mergeSchemas } from "apollo-server";

import { typeDefs as accountTypeDefs } from "./account.type_defs";
import { typeDefs as dataEntryTypeDefs } from "./data_entry.type_defs";
import { typeDefs as signerTypeDefs } from "./signer.type_defs";

import { resolvers as accountResolvers } from "./account.resolvers";

const typeDefs = [accountTypeDefs, dataEntryTypeDefs, signerTypeDefs];
const schema = makeExecutableSchema({ typeDefs });
addMockFunctionsToSchema({ schema });

const resolvers = [accountResolvers];
const schemas = [schema];

export default mergeSchemas({
  schemas,
  resolvers
})
