import { addMockFunctionsToSchema, makeExecutableSchema } from "apollo-server";
import { GraphQLSchema } from "graphql";
import { accountIDType } from "../account/schema";
import { dataEntryQuery, dataEntryType } from "./schema";

const dataEntrySchema: GraphQLSchema = makeExecutableSchema({
  typeDefs: [accountIDType, dataEntryType, dataEntryQuery]
});
addMockFunctionsToSchema({ schema: dataEntrySchema });

export { dataEntrySchema };
