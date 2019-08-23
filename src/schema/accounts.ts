import { gql } from "apollo-server";

export const typeDefs = gql`
  "Represents the [public key](https://www.stellar.org/developers/guides/concepts/accounts.html#account-id) of the particular account"
  scalar AccountID

  "Represents [thresholds](https://www.stellar.org/developers/guides/concepts/accounts.html#thresholds) for different access levels"
  type AccountThresholds {
    "The weight of the master key"
    masterWeight: Int!
    "The threshold this account sets on all operations it performs that have a low threshold"
    low: Int!
    "The threshold this account sets on all operations it performs that have a medium threshold"
    medium: Int!
    "The threshold this account sets on all operations it performs that have a high threshold"
    high: Int!
  }

  "Represents a single [account](https://www.stellar.org/developers/guides/concepts/accounts.html) on Stellar network"
  type Account {
    "Account's [public key](https://www.stellar.org/developers/guides/concepts/accounts.html#account-id)"
    id: AccountID!
    "The current transaction sequence number of the account"
    sequenceNumber: String!
    "Number of other [entries](https://www.stellar.org/developers/guides/concepts/ledger.html#ledger-entries) the account owns"
    numSubentries: Int!
    "A minimum balance of luments account must maintain"
    reservedBalance: String!
    "Account designated to receive [inflation](https://www.stellar.org/developers/guides/concepts/inflation.html)"
    inflationDestination: Account
    "A domain name that can be added to the account. [More info](https://www.stellar.org/developers/guides/concepts/accounts.html#home-domain)"
    homeDomain: String
    "Thresholds for different access levels this account set"
    thresholds: AccountThresholds!
    "[Signers](https://www.stellar.org/developers/guides/concepts/multi-sig.html) of the account"
    signers: [Signer]
    "Ledger, in which account was modified last time"
    ledger: Ledger!
    "[Data entries](https://www.stellar.org/developers/guides/concepts/list-of-operations.html#manage-data), attached to the account"
    data: [DataEntry]
    "All assets, issued by this account"
    assets(first: Int, after: String, last: Int, before: String): AssetConnection
    "[Balances](https://www.stellar.org/developers/guides/concepts/assets.html#trustlines) of this account"
    balances: [Balance]
    "A list of [operations](https://www.stellar.org/developers/guides/concepts/operations.html) on the Stellar network that the account performed"
    operations(first: Int, after: String, last: Int, before: String, order: Order): OperationConnection
    """
    A list of payment-related operations where the given account was either the sender or receiver
    The payment-related operations are:

      - create account
      - payment
      - path payment
      - account merge
    """
    payments(first: Int, after: String, last: Int, before: String): OperationConnection
    trades(first: Int, after: String, last: Int, before: String): TradeConnection
    transactions(first: Int, last: Int, before: String, after: String): TransactionConnection
    "A list of offers, created by this account"
    offers(selling: AssetID, buying: AssetID, first: Int, after: String, last: Int, before: String): OfferConnection
  }

  "Represents a current account state, which is broadcasted to subscribers on account's update"
  type AccountValues {
    "Account's [public key](https://www.stellar.org/developers/guides/concepts/accounts.html#account-id)"
    id: AccountID!
    "The current transaction sequence number of the account"
    sequenceNumber: String!
    "Number of other [entries](https://www.stellar.org/developers/guides/concepts/ledger.html#ledger-entries) the account owns"
    numSubentries: Int!
    "Account designated to receive [inflation](https://www.stellar.org/developers/guides/concepts/inflation.html)"
    inflationDestination: Account
    "A domain name that can be added to the account. [More info](https://www.stellar.org/developers/guides/concepts/accounts.html#home-domain)"
    homeDomain: String
    "Thresholds for different access levels this account set"
    thresholds: AccountThresholds!
    "[Signers](https://www.stellar.org/developers/guides/concepts/multi-sig.html) of the account"
    signers: [Signer]
  }

  type AccountConnection {
    pageInfo: PageInfo!
    nodes: [Account]
    edges: [AccountEdge]
  }

  type AccountEdge {
    cursor: String!
    node: Account
  }

  "Represents an account update payload, which is broadcasting to subscribers"
  type AccountSubscriptionPayload {
    id: AccountID!
    mutationType: MutationType!
    values: AccountValues
  }

  enum SignerType {
    ed25519
    preAuthX
    hashX
  }

  "Represents a [signers](https://www.stellar.org/developers/guides/concepts/multi-sig.html#additional-signing-keys) of the account"
  type Signer {
    "Public key of this signer"
    signer: AccountID!
    "This signer's weight"
    weight: Int!
    type: SignerType
  }

  input DataInput {
    name: String
    value: String
  }

  extend type Query {
    "Get single account by the id"
    account(id: AccountID!): Account
    "Get a lists of accounts by the ids"
    accounts(
      ids: [AccountID!]
      inflationDestination: AccountID
      homeDomain: String
      data: DataInput
      first: Int
      last: Int
      after: String
      before: String
    ): AccountConnection
  }

  extend type Subscription {
    "Subscribe on account updates"
    account(args: EventInput): AccountSubscriptionPayload
  }
`;
