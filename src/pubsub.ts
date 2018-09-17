import { PubSub } from "graphql-subscriptions";

export const pubsub = new PubSub();

export const LEDGER_CREATED = "LEDGER_CREATED";

// Account events concern all operations happened with account itself and it's signers.
// TrustLines/DataEntries are not involved.
export const ACCOUNT = "ACCOUNT";
export const TRUST_LINE = "TRUST_LINE";
export const DATA_ENTRY = "DATA_ENTRY";
