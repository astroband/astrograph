import { addMockFunctionsToSchema, makeExecutableSchema } from "apollo-server";
import { GraphQLSchema } from "graphql";

import { dataEntryType } from "../data_entry/schema";

import { accountIDType } from "../scalars/account_id.type";
import { accountFlagsType, accountQuery, accountSignerType, accountThresholdsType, accountType } from "./schema";

const accountSchema: GraphQLSchema = makeExecutableSchema({
  typeDefs: [
    accountIDType,
    dataEntryType,
    accountFlagsType,
    accountSignerType,
    accountThresholdsType,
    accountType,
    accountQuery
  ]
});
addMockFunctionsToSchema({ schema: accountSchema });

export { accountSchema };
