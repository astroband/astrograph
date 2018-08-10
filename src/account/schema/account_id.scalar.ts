import { gql } from "apollo-server";

const accountIDScalar = gql`
  scalar AccountID
`;

export { accountIDScalar };
