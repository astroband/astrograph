import { addMockFunctionsToSchema, makeExecutableSchema } from "apollo-server";
import { GraphQLSchema } from "graphql";
import { transactionQuery, transactionType } from "./schema";

const transactionSchema: GraphQLSchema = makeExecutableSchema({
  typeDefs: [transactionType, transactionQuery]
});
addMockFunctionsToSchema({ schema: transactionSchema });

export { transactionSchema };
