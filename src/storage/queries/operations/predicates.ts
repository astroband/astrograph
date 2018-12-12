// This module stores all predicates we query from Dgraph
// for all different types of Stellar operations
import { OperationKinds } from "./types";

export const queryPredicates = {
  [OperationKinds.Payment]: `
    account.destination { id }
    amount
    asset {
      native
      code
      issuer { id }
    }`,
  [OperationKinds.SetOption]: `
    master_weight
    home_domain
    clear_flags
    set_flags
    thresholds {
      high
      med
      low
    }
    account.inflation_dest { id }
    signer {
      account { id }
      weight
    }`,
  [OperationKinds.AccountMerge]: `
    account.destination { id }
  `,
  [OperationKinds.AllowTrust]: `
    trustor { id }
    asset_code
    authorize
  `,
  [OperationKinds.BumpSequence]: `
    bump_to
  `
};
