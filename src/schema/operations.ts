import { gql } from "apollo-server";

export const typeDefs = gql`
  enum OperationType {
    payment
    setOption
    accountMerge
    allowTrust
    bumpSequence
    changeTrust
    createAccount
    manageDatum
    manageSellOffer
    manageBuyOffer
    createPassiveSellOffer
    pathPayment
    inflation
    pathPaymentStrictSend
  }

  "Attributes all Stellar [operations](https://www.stellar.org/developers/guides/concepts/operations.html) share"
  interface Operation {
    "Operation id, assigned by Horizon"
    id: String!
    type: OperationType!
    "Account on which behalf operation was executed"
    sourceAccount: Account!
    "When operations was executed"
    dateTime: DateTime!
    "Transaction that contains this operation"
    transaction: Transaction!
  }

  "Represents [payment operation](https://www.stellar.org/developers/guides/concepts/list-of-operations.html#payment)"
  type PaymentOperation implements Operation {
    "Operation id, assigned by Horizon"
    id: String!
    type: OperationType!
    "Account on which behalf operation was executed"
    sourceAccount: Account!
    "When operations was executed"
    dateTime: DateTime!
    "Transaction that contains this operation"
    transaction: Transaction!
    "Account address that received the payment"
    destination: Account!
    "Asset that was sent to the destination account"
    asset: Asset!
    "Amount of the asset that was sent"
    amount: String!
  }

  "Represents [set options operation](https://www.stellar.org/developers/guides/concepts/list-of-operations.html#set-options)"
  type SetOptionsOperation implements Operation {
    "Operation id, assigned by Horizon"
    id: String!
    type: OperationType!
    "Account on which behalf operation was executed"
    sourceAccount: Account!
    "When operations was executed"
    dateTime: DateTime!
    "Transaction that contains this operation"
    transaction: Transaction!
    "Indicates which flags to clear"
    clearFlags: Int
    "Indicates which flags to set"
    setFlags: Int
    "Indicates, which home domain to set on account"
    homeDomain: String
    "Indicates value of master weight to set"
    masterWeight: Int
    "Account thresholds to set"
    thresholds: SetOptionsThresholds
    "Represents a signer to add to the account"
    signer: SetOptionsSigner
    "Account to use as the inflation destination"
    inflationDestination: Account
  }

  "Represents [account merge operation](https://www.stellar.org/developers/guides/concepts/list-of-operations.html#account-merge)"
  type AccountMergeOperation implements Operation {
    "Operation id, assigned by Horizon"
    id: String!
    type: OperationType!
    "Account on which behalf operation was executed"
    sourceAccount: Account!
    "When operations was executed"
    dateTime: DateTime!
    "Transaction that contains this operation"
    transaction: Transaction!
    "The account that receives the remaining XLM balance of the source account"
    destination: Account!
  }

  "Represents [allow trust operation](https://www.stellar.org/developers/guides/concepts/list-of-operations.html#allow-trust)"
  type AllowTrustOperation implements Operation {
    "Operation id, assigned by Horizon"
    id: String!
    type: OperationType!
    "Account on which behalf operation was executed"
    sourceAccount: Account!
    "When operations was executed"
    dateTime: DateTime!
    "Transaction that contains this operation"
    transaction: Transaction!
    "The account of the recipient of the trustline"
    trustor: Account!
    "Flag indicating whether the trustline is authorized"
    authorize: Boolean!
    "The asset of the trustline the source account is authorizing"
    asset: Asset!
  }

  "Represents [bump sequence operation](https://www.stellar.org/developers/guides/concepts/list-of-operations.html#bump-sequence)"
  type BumpSequenceOperation implements Operation {
    "Operation id, assigned by Horizon"
    id: String!
    type: OperationType!
    "Account on which behalf operation was executed"
    sourceAccount: Account!
    "When operations was executed"
    dateTime: DateTime!
    "Transaction that contains this operation"
    transaction: Transaction!
    "Desired value for the operation’s source account sequence number"
    bumpTo: Int!
  }

  "Represents [change trust operation](https://www.stellar.org/developers/guides/concepts/list-of-operations.html#change-trust)"
  type ChangeTrustOperation implements Operation {
    "Operation id, assigned by Horizon"
    id: String!
    type: OperationType!
    "Account on which behalf operation was executed"
    sourceAccount: Account!
    "When operations was executed"
    dateTime: DateTime!
    "Transaction that contains this operation"
    transaction: Transaction!
    "The limit of the trustline"
    limit: String!
    "The asset of the trustline"
    asset: Asset!
  }

  "Represents [create account operation](https://www.stellar.org/developers/guides/concepts/list-of-operations.html#create-account)"
  type CreateAccountOperation implements Operation {
    "Operation id, assigned by Horizon"
    id: String!
    type: OperationType!
    "Account on which behalf operation was executed"
    sourceAccount: Account!
    "When operations was executed"
    dateTime: DateTime!
    "Transaction that contains this operation"
    transaction: Transaction!
    "Amount of XLM to send to the newly created account"
    startingBalance: String!
    "Account address that is created and funded"
    destination: Account!
  }

  "Represents [manage data operation](https://www.stellar.org/developers/guides/concepts/list-of-operations.html#manage-data)"
  type ManageDatumOperation implements Operation {
    "Operation id, assigned by Horizon"
    id: String!
    type: OperationType!
    "Account on which behalf operation was executed"
    sourceAccount: Account!
    "When operations was executed"
    dateTime: DateTime!
    "Transaction that contains this operation"
    transaction: Transaction!
    name: String!
    value: String
  }

  "Represents [manage sell offer operation](https://www.stellar.org/developers/guides/concepts/list-of-operations.html#manage-sell-offer)"
  type ManageSellOfferOperation implements Operation {
    "Operation id, assigned by Horizon"
    id: String!
    type: OperationType!
    "Account on which behalf operation was executed"
    sourceAccount: Account!
    "When operations was executed"
    dateTime: DateTime!
    "Transaction that contains this operation"
    transaction: Transaction!
    "Rational representation of the price"
    priceComponents: OfferPriceComponents!
    "Price of 1 unit of \`selling\` in terms of \`buying\`"
    price: String!
    offerId: String!
    "Amount of \`selling\` being sold"
    amount: String!
    "Asset the offer creator is selling"
    assetSelling: Asset!
    "Asset the offer creator is buying"
    assetBuying: Asset!
  }

  "Represents [manage buy offer operation](https://www.stellar.org/developers/guides/concepts/list-of-operations.html#manage-buy-offer)"
  type ManageBuyOfferOperation implements Operation {
    "Operation id, assigned by Horizon"
    id: String!
    type: OperationType!
    "Account on which behalf operation was executed"
    sourceAccount: Account!
    "When operations was executed"
    dateTime: DateTime!
    "Transaction that contains this operation"
    transaction: Transaction!
    "Rational representation of the price"
    priceComponents: OfferPriceComponents!
    "Price of 1 unit of \`selling\` in terms of \`buying\`"
    price: String!
    offerId: String!
    "Amount of \`selling\` being sold"
    amount: String!
    "Asset the offer creator is selling"
    assetSelling: Asset!
    "Asset the offer creator is buying"
    assetBuying: Asset!
  }

  "Represents [create passive offer operation](https://www.stellar.org/developers/guides/concepts/list-of-operations.html#create-passive-offer)"
  type CreatePassiveSellOfferOperation implements Operation {
    "Operation id, assigned by Horizon"
    id: String!
    type: OperationType!
    "Account on which behalf operation was executed"
    sourceAccount: Account!
    "When operations was executed"
    dateTime: DateTime!
    "Transaction that contains this operation"
    transaction: Transaction!
    priceComponents: OfferPriceComponents!
    price: String!
    amount: String!
    assetSelling: Asset!
    assetBuying: Asset!
  }

  "Represents [path payment operation](https://www.stellar.org/developers/guides/concepts/list-of-operations.html#path-payment)"
  type PathPaymentOperation implements Operation {
    "Operation id, assigned by Horizon"
    id: String!
    type: OperationType!
    "Account on which behalf operation was executed"
    sourceAccount: Account!
    "When operations was executed"
    dateTime: DateTime!
    "Transaction that contains this operation"
    transaction: Transaction!
    "Max send amount"
    sendMax: String!
    "Amount of \`sourceAsset\` sent by the source account. Can be empty for the failed transaction"
    amountSent: String
    "Amount of \`destinationAsset\` received by the destination account. Can be empty for the failed transaction"
    amountReceived: String
    "What asset sender wants receiver to receive in the end"
    destinationAsset: Asset!
    "What asset sender wants to send"
    sourceAsset: Asset!
    "Payment receiver account"
    destinationAccount: Account!
  }

  type InflationOperation implements Operation {
    "Operation id, assigned by Horizon"
    id: String!
    type: OperationType!
    "Account on which behalf operation was executed"
    sourceAccount: Account!
    "When operations was executed"
    dateTime: DateTime!
    "Transaction that contains this operation"
    transaction: Transaction!
  }

  "Represents [path payment operation](https://www.stellar.org/developers/guides/concepts/list-of-operations.html#path-payment)"
  type PathPaymentStrictSendOperation implements Operation {
    "Operation id, assigned by Horizon"
    id: String!
    type: OperationType!
    "Account on which behalf operation was executed"
    sourceAccount: Account!
    "When operations was executed"
    dateTime: DateTime!
    "Transaction that contains this operation"
    transaction: Transaction!
    "Minimum amount of \`destinationAsset\` receiver will get. Can be empty for the failed transaction"
    destinationMin: String!
    "Amount of \`sourceAsset\` sent by the source account. Can be empty for the failed transaction"
    amountSent: String
    "Amount of \`destinationAsset\` received by the destination account"
    amountReceived: String
    "What asset sender wants receiver to receive in the end"
    destinationAsset: Asset!
    "What asset sender wants to send"
    sourceAsset: Asset!
    "Payment receiver account"
    destinationAccount: Account!
  }

  """
  \`{numerator, denominator}\` representation of the price
  For example, if you want to sell 30 XLM and buy 5 BTC, the price would be \`{5,30}\`
  """
  type OfferPriceComponents {
    n: Int!
    d: Int!
  }

  type SetOptionsThresholds {
    low: Int
    medium: Int
    high: Int
  }

  type SetOptionsSigner {
    account: Account
    weight: Int
  }

  type OperationConnection {
    pageInfo: PageInfo!
    nodes: [Operation]
    edges: [OperationEdge]
  }

  type OperationEdge {
    cursor: String!
    node: Operation
  }

  extend type Query {
    "Get list of operations"
    operations(first: Int, after: String, last: Int, before: String): OperationConnection
    "Get single operation by its id"
    operation(id: String): Operation
    "Get payment-related operations"
    payments(first: Int, after: String, last: Int, before: String): OperationConnection
  }

  extend type Subscription {
    "Subscribe to new operations on the network"
    operations(
      txSource: [AccountID]
      opSource: [AccountID]
      type: [OperationType]
      destination: [AccountID]
      asset: [AssetID]
    ): Operation!
  }
`;
