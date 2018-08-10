import { addMockFunctionsToSchema, makeExecutableSchema } from "apollo-server";
import { GraphQLSchema } from "graphql";
import { accountIDType } from "../account/schema";
import { signerQuery, signerType } from "./schema";

const signerSchema: GraphQLSchema = makeExecutableSchema({
  typeDefs: [accountIDType, signerType, signerQuery]
});
addMockFunctionsToSchema({ schema: signerSchema });

export { signerSchema };
