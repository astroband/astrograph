import { addMockFunctionsToSchema, makeExecutableSchema } from "apollo-server";
import { GraphQLSchema } from "graphql";
import {
  accountDataEntryType,
  accountFlagsType,
  accountIDScalar,
  accountQuery,
  accountSignerType,
  accountThresholdsType,
  accountType
} from "./schema";

const accountSchema: GraphQLSchema = makeExecutableSchema({
  typeDefs: [
    accountDataEntryType,
    accountIDScalar,
    accountFlagsType,
    accountSignerType,
    accountThresholdsType,
    accountType,
    accountQuery
  ]
});
addMockFunctionsToSchema({ schema: accountSchema });

export { accountSchema };
