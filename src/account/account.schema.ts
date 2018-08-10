import { addMockFunctionsToSchema, makeExecutableSchema } from "apollo-server";
import { GraphQLSchema } from "graphql";

import { dataEntryType } from "../data_entry/schema";
import { signerType } from "../signer/schema";

import { accountFlagsType, accountIDType, accountQuery, accountThresholdsType, accountType } from "./schema";

const accountSchema: GraphQLSchema = makeExecutableSchema({
  typeDefs: [
    accountIDType,
    dataEntryType,
    signerType,
    accountFlagsType,
    accountThresholdsType,
    accountType,
    accountQuery
  ]
});
addMockFunctionsToSchema({ schema: accountSchema });

export { accountSchema };
