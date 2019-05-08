import { gql } from "apollo-server";

export const typeDefs = gql`
  "Represents the [public key](https://www.stellar.org/developers/guides/concepts/accounts.html#account-id) of the particular account"
  scalar AccountID

  "Represents three flags, used by issuers of assets"
  type AccountFlags {
    "Requires the issuing account to give other accounts permission before they can hold the issuing account’s credit"
    authRequired: Boolean!
    "Allows the issuing account to revoke its credit held by other accounts"
    authRevocable: Boolean!
    "If this is set then none of the authorization flags can be set and the account can never be deleted"
    authImmutable: Boolean!
  }

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

  interface IAccount {
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
    "Flags used, by issuers of assets"
    flags: AccountFlags!
    "[Signers](https://www.stellar.org/developers/guides/concepts/multi-sig.html) of the account"
    signers: [Signer]
  }

  "Represents a single [account](https://www.stellar.org/developers/guides/concepts/accounts.html) on Stellar network"
  type Account implements IAccount {
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
    "Flags used, by issuers of assets"
    flags: AccountFlags!
    "[Signers](https://www.stellar.org/developers/guides/concepts/multi-sig.html) of the account"
    signers: [Signer]
    "Ledger, in which account was modified last time"
    ledger: Ledger!
    "[Data entries](https://www.stellar.org/developers/guides/concepts/list-of-operations.html#manage-data), attached to the account"
    data: [DataEntry]
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
    "A list of all effects that changed this account"
    effects(first: Int, after: String, last: Int, before: String): EffectConnection
    trades(first: Int, after: String, last: Int, before: String): TradeConnection
    transactions(first: Int, last: Int, before: String, after: String): TransactionConnection
  }

  "Represents a current account state, which is broadcasted to subscribers on account's update"
  type AccountValues implements IAccount {
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
    "Flags used, by issuers of assets"
    flags: AccountFlags!
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

  "Represents a [signers](https://www.stellar.org/developers/guides/concepts/multi-sig.html#additional-signing-keys) of the account"
  type Signer {
    "Which account this signer belongs to"
    account: Account!
    "Public key of this signer"
    signer: AccountID!
    "This signer's weight"
    weight: Int!
  }

  extend type Query {
    "Get single account by the id"
    account(id: AccountID!): Account
    "Get a lists of accounts by the ids"
    accounts(
      ids: [AccountID!]
      homeDomain: String
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
