// This module stores all predicates we query from Dgraph
// for all different types of Stellar operations
import { OperationKinds } from "../../../model/operation";

export const queryPredicates = {
  [OperationKinds.Payment]: [
    "op.destination { account.id }",
    "amount",
    `payment_op.asset {
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
    "set_options_op.inflation_destination { account.id }",
    `set_options_op.signer {
      account { account.id }
      weight
    }`
  ],
  [OperationKinds.AccountMerge]: ["op.destination { account.id }"],
  [OperationKinds.AllowTrust]: [
    "allow_trust_op.trustor { account.id }",
    `allow_trust_op.asset {
      code
      issuer { account.id }
      native
    }`,
    "authorize"
  ],
  [OperationKinds.BumpSequence]: ["bump_to"],
  [OperationKinds.ChangeTrust]: [
    "limit",
    `change_trust_op.asset {
      native
      code
      asset.issuer { account.id }
    }`
  ],
  [OperationKinds.CreateAccount]: ["starting_balance", "op.destination { account.id }"],
  [OperationKinds.ManageData]: ["name", "value"],
  [OperationKinds.ManageOffer]: [
    "offer_id",
    "price_n",
    "price_d",
    "price",
    `manage_offer_op.asset buying {
      native
      code
      asset.issuer { account.id }
    }`,
    `manage_offer_op.asset_selling {
      native
      code
      asset.issuer { account.id }
    }`,
    "amount"
  ],
  [OperationKinds.PathPayment]: [
    "send_max",
    "amount",
    "op.destination { account.id }",
    `path_payment_op.asset_destination {
      native
      code
      asset.issuer { account.id }
    }`,
    `path_payment_op.asset_source {
      native
      code
      asset.issuer { account.id }
    }`,
    `path_payment_op.assets_path {
      native
      code
      asset.issuer { account.id }
    }`
  ]
};
