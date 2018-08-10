import { addMockFunctionsToSchema, makeExecutableSchema } from "apollo-server";
import { GraphQLSchema } from "graphql";
import { accountFlagsType, accountIDScalar, accountQuery, accountThresholdsType, accountType } from "./schema";

const accountSchema: GraphQLSchema = makeExecutableSchema({
  typeDefs: [accountIDScalar, accountFlagsType, accountThresholdsType, accountType, accountQuery]
});
addMockFunctionsToSchema({ schema: accountSchema });

export { accountSchema };
