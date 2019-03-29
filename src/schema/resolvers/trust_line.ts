import { withFilter } from "graphql-subscriptions";
import { pubsub, TRUST_LINE } from "../../pubsub";
import { accountResolver, assetResolver, eventMatches, ledgerResolver } from "./util";

const trustLineSubscription = (event: string) => {
  return {
    subscribe: withFilter(
      () => pubsub.asyncIterator([event]),
      (payload, variables) => {
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
    account: accountResolver,
    ledger: ledgerResolver,
    asset: assetResolver
  },
  TrustLineValues: { account: accountResolver },
  TrustLineSubscriptionPayload: { account: accountResolver },
  Subscription: { trustLine: trustLineSubscription(TRUST_LINE) }
};
