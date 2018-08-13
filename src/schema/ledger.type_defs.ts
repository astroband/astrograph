import { gql } from "apollo-server";

export const typeDefs = gql`
  type Ledger {
    ledgerSeq: Int!
    ledgerVersion: Int!
    previousLedgerHash: String!
    txSetResultHash: String!
    baseFee: Int!
    baseReserve: Int!
    maxTxSetSize: Int!
  }

  type Query {
    ledger(seq: Int!): Ledger
  }

  type Subscription {
    ledgerCreated: Ledger
  }
`;

// type Query {
//   dataEntries(id: AccountID!): [DataEntry]
//   signers(id: AccountID!): [Signer]
//   transaction(id: String!): Transaction
//   transactionsByLedgerSeq(ledgerSeq: Int!): [Transaction!]
// }
