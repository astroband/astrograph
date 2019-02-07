// This module stores all predicates we query from Dgraph
// for all different types of Stellar operations
import { OperationKinds } from "../../../model/operation";

export const queryPredicates = {
  [OperationKinds.Payment]: [
    "account.destination { account.id }",
    "amount",
    `asset {
      native
      code
      asset.issuer { account.id }
    }`
  ],
  [OperationKinds.SetOption]: [
    "master_weight",
    "home_domain",
    "clear_flags",
    "set_flags",
    `thresholds {
      high
      med
      low
    }`,
    "account.inflation_dest { account.id }",
    `signer {
      account { account.id }
      weight
    }`
  ],
  [OperationKinds.AccountMerge]: ["account.destination { account.id }"],
  [OperationKinds.AllowTrust]: ["trustor { account.id }", "asset_code", "authorize"],
  [OperationKinds.BumpSequence]: ["bump_to"],
  [OperationKinds.ChangeTrust]: [
    "limit",
    `asset {
      native
      code
      asset.issuer { account.id }
    }`
  ],
  [OperationKinds.CreateAccount]: ["starting_balance", "account.destination { account.id }"],
  [OperationKinds.ManageData]: ["name", "value"],
  [OperationKinds.ManageOffer]: [
    "offer_id",
    "price_n",
    "price_d",
    "price",
    `asset.buying {
      native
      code
      asset.issuer { account.id }
    }`,
    `asset.selling {
      native
      code
      asset.issuer { account.id }
    }`,
    "amount"
  ],
  [OperationKinds.PathPayment]: [
    "send_max",
    "dest_amount",
    "account.destination { account.id }",
    `asset.destination {
      native
      code
      asset.issuer { account.id }
    }`,
    `asset.source {
      native
      code
      asset.issuer { account.id }
    }`,
    `assets.path {
      native
      code
      asset.issuer { account.id }
    }`
  ]
};
