import { addMockFunctionsToSchema, makeExecutableSchema } from "apollo-server";
import { GraphQLSchema } from "graphql";
import { ledgerQuery, ledgerSubscription, ledgerType } from "./schema";

const ledgerSchema: GraphQLSchema = makeExecutableSchema({
  typeDefs: [ledgerType, ledgerQuery, ledgerSubscription]
});
addMockFunctionsToSchema({ schema: ledgerSchema });

export { ledgerSchema };
