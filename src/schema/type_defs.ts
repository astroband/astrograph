import { gql } from "apollo-server";

export const typeDefs = gql`
  "A date-time string in ISO 8601 format"
  scalar DateTime

  "Possible directions in which to order a list of items when provided an \`order\` argument"
  enum Order {
    desc
    asc
  }

  "Information about pagination in a connection"
  type PageInfo {
    "When paginating backwards, the cursor to continue"
    startCursor: String
    "When paginating forwards, the cursor to continue"
    endCursor: String
  }

  "Stellar ledger entities lifecycle events you can subscribe to"
  enum MutationType {
    CREATE
    UPDATE
    REMOVE
  }

  interface IDataEntry {
    name: String!
    value: String!
    ledger: Ledger!
  }

  "Represents a [Data Entry](https://www.stellar.org/developers/guides/concepts/list-of-operations.html#manage-data) (name/value pair) that is attached to a particular account"
  type DataEntry implements IDataEntry {
    name: String!
    value: String!
    "Ledger sequence this data entry was created at"
    ledger: Ledger!
  }

  "Represents a current [Data Entry](https://www.stellar.org/developers/guides/concepts/list-of-operations.html#manage-data) (name/value pair) state, which is broadcasted to subscribers"
  type DataEntryValues implements IDataEntry {
    account: Account!
    name: String!
    value: String!
    ledger: Ledger!
  }

  "Represents a Data Entry update payload, which is broadcasting to subscribers"
  type DataEntrySubscriptionPayload {
    account: Account!
    name: String!
    mutationType: MutationType!
    values: DataEntryValues
  }

  interface IBalance {
    asset: Asset!
    limit: String!
    balance: String!
    authorized: Boolean!
  }

  "Represents a single [trustline](https://www.stellar.org/developers/guides/concepts/assets.html#trustlines) of a particular account"
  type Balance implements IBalance {
    account: Account
    asset: Asset!
    limit: String!
    balance: String!
    "how much of this asset can actually be sent considering selling liabilities (and base reserve for native lumens)"
    spendableBalance: String!
    "how much of this asset can be received considering the limit and buying liabilities"
    receivableBalance: String!
    authorized: Boolean!
    ledger: Ledger!
  }

  type BalanceConnection {
    pageInfo: PageInfo!
    nodes: [Balance]
    edges: [BalanceEdge]
  }

  type BalanceEdge {
    cursor: String!
    node: Balance
  }

  "Represents a current [trustline](https://www.stellar.org/developers/guides/concepts/assets.html#trustlines) state, which is broadcasting to subscribers"
  type BalanceValues implements IBalance {
    account: Account
    asset: Asset!
    limit: String!
    balance: String!
    authorized: Boolean!
  }

  "Represents a [trustline](https://www.stellar.org/developers/guides/concepts/assets.html#trustlines) update payload, which is broadcasting to subscribers"
  type BalanceSubscriptionPayload {
    account: Account!
    asset: Asset!
    mutationType: MutationType!
    values: BalanceValues
  }

  "Input type, which represents subscription filtering options"
  input EventInput {
    mutationTypeIn: [MutationType!]
    idEq: AccountID
    idIn: [AccountID!]
  }

  type Subscription {
    "Subscribe on [trustlines](https://www.stellar.org/developers/guides/concepts/assets.html#trustlines) updates"
    balance(args: EventInput): BalanceSubscriptionPayload
    "Subscribe on [data entries](https://www.stellar.org/developers/guides/concepts/list-of-operations.html#manage-data) updates"
    dataEntry(args: EventInput): DataEntrySubscriptionPayload
  }
`;
