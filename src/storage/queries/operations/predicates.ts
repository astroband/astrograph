// This module stores all predicates we query from Dgraph
// for all different types of Stellar operations
import { OperationKinds } from "./types";

export const queryPredicates = {
  [OperationKinds.Payment]: [
    "account.destination { id }",
    "amount",
    `asset {
      native
      code
      issuer { id }
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
    "account.inflation_dest { id }",
    `signer {
      account { id }
      weight
    }`
  ],
  [OperationKinds.AccountMerge]: ["account.destination { id }"],
  [OperationKinds.AllowTrust]: ["trustor { id }", "asset_code", "authorize"],
  [OperationKinds.BumpSequence]: ["bump_to"],
  [OperationKinds.ChangeTrust]: [
    "limit",
    `asset {
      code
      issuer { id }
    }`
  ],
  [OperationKinds.CreateAccount]: ["starting_balance", "account.destination { id }"],
  [OperationKinds.ManageData]: ["name", "value"],
  [OperationKinds.ManageOffer]: [
    "offer_id",
    "price_n",
    "price_d",
    "price",
    `asset.buying {
      native
      code
      issuer { id }
    }`,
    `asset.selling {
      native
      code
      issuer { id }
    }`,
    "amount"
  ],
  [OperationKinds.PathPayment]: [
    "send_max",
    "dest_amount",
    "account.destination { id }",
    `asset.destination {
      native
      code
      issuer { id }
    }`,
    `asset.source {
      native
      code
      issuer { id }
    }`,
    `assets.path {
      native
      code
      issuer { id }
    }`
  ]
};
