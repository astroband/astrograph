import { PubSub } from "graphql-subscriptions";

export const pubsub = new PubSub();

export const ACCOUNT_CREATED = "ACCOUNT_CREATED";
export const ACCOUNT_UPDATED = "ACCOUNT_UPDATED";
export const ACCOUNT_DELETED = "ACCOUNT_DELETED";
