import { withFilter } from "graphql-subscriptions";
import { account as accountResolver, ledger as ledgerResolver } from "./shared";
import { eventMatches } from "./util";

import { IApolloContext } from "../../graphql_server";
import { DATA_ENTRY, pubsub } from "../../pubsub";

const dataEntrySubscription = (event: string) => {
  return {
    subscribe: withFilter(
      () => pubsub.asyncIterator([event]),
      (payload, variables) => {
        return eventMatches(variables.args, payload.accountID, payload.mutationType);
      }
    ),

    resolve(payload: any, args: any, ctx: IApolloContext, info: any) {
      return payload;
    }
  };
};

export default {
  DataEntry: { ledger: ledgerResolver },
  DataEntryValues: {
    account: accountResolver,
    ledger: ledgerResolver
  },
  DataEntrySubscriptionPayload: { account: accountResolver },
  Subscription: {
    dataEntry: dataEntrySubscription(DATA_ENTRY)
  }
};
