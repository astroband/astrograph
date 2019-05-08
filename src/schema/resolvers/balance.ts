import { withFilter } from "graphql-subscriptions";
import { IApolloContext } from "../../graphql_server";
import { Balance, BalanceSubscriptionPayload } from "../../model";
import { BALANCE, pubsub } from "../../pubsub";
import { toFloatAmountString } from "../../util/stellar";
import * as resolvers from "./shared";
import { eventMatches } from "./util";

const balanceSubscription = (event: string) => {
  return {
    subscribe: withFilter(
      () => pubsub.asyncIterator(event),
      (payload: BalanceSubscriptionPayload, variables) => {
        return eventMatches(variables.args, payload.account, payload.mutationType);
      }
    ),

    resolve(payload: any, args: any, ctx: IApolloContext, info: any) {
      return payload;
    }
  };
};

const floatAmountFormatResolver = (field: string) => {
  return (root: Balance) => toFloatAmountString(root[field]);
};

export default {
  Balance: {
    account: resolvers.account,
    ledger: resolvers.ledger,
    asset: resolvers.asset,
    limit: floatAmountFormatResolver("limit"),
    balance: floatAmountFormatResolver("balance"),
    spendableBalance: floatAmountFormatResolver("spendableBalance"),
    receivableBalance: floatAmountFormatResolver("receivableBalance")
  },
  BalanceSubscriptionPayload: {
    account: resolvers.account,
    asset: resolvers.asset
  },
  BalanceValues: {
    account: resolvers.account,
    asset: resolvers.asset,
    limit: (root: Balance) => toFloatAmountString(root.limit),
    balance: (root: Balance) => toFloatAmountString(root.balance)
  },
  Subscription: { balance: balanceSubscription(BALANCE) }
};
