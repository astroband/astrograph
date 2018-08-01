import { gql } from "apollo-server";

const ledgerType = gql`
  type Ledger {
    ledgerSeq: Int!
    ledgerVersion: Int!
    previousLedgerHash: String!
    txSetResultHash: String!
    baseFee: Int!
    baseReserve: Int!
    maxTxSetSize: Int!
  }
`;

export { ledgerType };
