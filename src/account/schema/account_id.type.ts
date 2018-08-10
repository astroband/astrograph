import { gql } from "apollo-server";

const accountIDType = gql`
  scalar AccountID
`;

export { accountIDType };
