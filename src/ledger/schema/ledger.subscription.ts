import { gql } from "apollo-server";

const ledgerSubscription = gql`
  type Subscription {
    ledgerCreated: Ledger
  }
`;
export { ledgerSubscription };
