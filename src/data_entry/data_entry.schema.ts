import { addMockFunctionsToSchema, makeExecutableSchema } from "apollo-server";
import { GraphQLSchema } from "graphql";
import { dataEntryQuery, dataEntryType } from "./schema";

const dataEntrySchema: GraphQLSchema = makeExecutableSchema({
  typeDefs: [dataEntryType, dataEntryQuery]
});
addMockFunctionsToSchema({ schema: dataEntrySchema });

export { dataEntrySchema };
