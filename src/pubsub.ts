import { PubSub } from "graphql-subscriptions";

export const pubsub = new PubSub();

export const LEDGER_CREATED = "LEDGER_CREATED";

// Account events concern all operations happened with account itself and it's signers.
// TrustLines/DataEntries are not involved.
export const ACCOUNT_CREATED = "ACCOUNT_CREATED";
export const ACCOUNT_UPDATED = "ACCOUNT_UPDATED";
export const ACCOUNT_REMOVED = "ACCOUNT_REMOVED";
