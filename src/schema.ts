import { addMockFunctionsToSchema, gql, makeExecutableSchema, mergeSchemas } from "apollo-server";
import { GraphQLSchema } from "graphql";

import { accountResolver } from "./account/account.resolver";
import { dataEntryResolver } from "./data_entry/data_entry.resolver";
import { ledgerResolver } from "./ledger/ledger.resolver";
import { signerResolver } from "./signer/signer.resolver";
import { transactionResolver } from "./transaction/transaction.resolver";

const typeDefs = gql`
  scalar AccountID

  type AccountFlags {
    authRequired: Boolean!
    authRevokable: Boolean!
    authImmutable: Boolean!
  }

  type AccountThresholds {
    masterWeight: Int!
    low: Int!
    medium: Int!
    high: Int!
  }

  type DataEntry {
    accountID: AccountID!
    name: String!
    value: String!
    lastModified: Int!
  }

  type Signer {
    accountID: AccountID!
    signer: AccountID!
    weight: Int!
  }

  type Account {
    id: AccountID!
    balance: Float!
    sequenceNumber: Float!
    numSubentries: Int!
    inflationDest: AccountID
    homeDomain: String
    thresholds: AccountThresholds!
    flags: AccountFlags!
    lastModified: Int!
    data: [DataEntry]
    signers: [Signer]
  }

  type Ledger {
    ledgerSeq: Int!
    ledgerVersion: Int!
    previousLedgerHash: String!
    txSetResultHash: String!
    baseFee: Int!
    baseReserve: Int!
    maxTxSetSize: Int!
  }

  type Transaction {
    ID: String!
    ledgerSeq: Int!
    index: Int!
    body: String!
    result: String!
    meta: String!
  }

  type Query {
    account(id: AccountID!): Account!
    dataEntries(id: AccountID!): [DataEntry]
    signers(id: AccountID!): [Signer]
    ledger(seq: Int!): Ledger
    transaction(id: String!): Transaction
    transactionsByLedgerSeq(ledgerSeq: Int!): [Transaction!]
  }

  type Subscription {
    ledgerCreated: Ledger
  }

`;

const schema: GraphQLSchema = makeExecutableSchema({ typeDefs });
addMockFunctionsToSchema({ schema });

const schemas = [schema];
const resolvers = [ledgerResolver, transactionResolver, signerResolver, dataEntryResolver, accountResolver];

export default mergeSchemas({
  schemas,
  resolvers
});
