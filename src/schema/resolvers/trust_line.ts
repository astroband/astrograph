import { withFilter } from "graphql-subscriptions";
import { TrustLineSubscriptionPayload } from "../../model";
import { pubsub, TRUST_LINE } from "../../pubsub";
import * as resolvers from "./shared";
import { eventMatches } from "./util";

const trustLineSubscription = (event: string) => {
  return {
    subscribe: withFilter(
      () => pubsub.asyncIterator(event),
      (payload: TrustLineSubscriptionPayload, variables) => {
        return eventMatches(variables.args, payload.account, payload.mutationType);
      }
    ),

    resolve(payload: any, args: any, ctx: any, info: any) {
      return payload;
    }
  };
};

export default {
  TrustLine: {
    account: resolvers.account,
    ledger: resolvers.ledger,
    asset: resolvers.asset
  },
  TrustLineSubscriptionPayload: { account: resolvers.account },
  TrustLineValues: { account: resolvers.account },
  Subscription: { trustLine: trustLineSubscription(TRUST_LINE) }
};
