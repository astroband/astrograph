import { addMockFunctionsToSchema, makeExecutableSchema } from "apollo-server";
import { GraphQLSchema } from "graphql";
import {
  accountFlagsType,
  accountIDScalar,
  accountQuery,
  accountSignerType,
  accountThresholdsType,
  accountType
} from "./schema";

//import { dataEntryType } from "../data_entry/schema";

const accountSchema: GraphQLSchema = makeExecutableSchema({
  typeDefs: [accountIDScalar, accountFlagsType, accountSignerType, accountThresholdsType, accountType, accountQuery]
});
addMockFunctionsToSchema({ schema: accountSchema });

export { accountSchema };
