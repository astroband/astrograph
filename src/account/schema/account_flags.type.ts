import { gql } from "apollo-server";

const accountFlagsType = gql`
  type AccountFlags {
    id: ID!
    authRequired: Boolean!
    authRevokable: Boolean!
    authImmutable: Boolean!
  }
`;

export { accountFlagsType };
