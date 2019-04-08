import { withFilter } from "graphql-subscriptions";
import { accountResolver, eventMatches, ledgerResolver } from "./util";

import { DATA_ENTRY, pubsub } from "../../pubsub";

const dataEntrySubscription = (event: string) => {
  return {
    subscribe: withFilter(
      () => pubsub.asyncIterator([event]),
      (payload, variables) => {
        return eventMatches(variables.args, payload.accountID, payload.mutationType);
      }
    ),

    resolve(payload: any, args: any, ctx: any, info: any) {
      return payload;
    }
  };
};

export default {
  IDataEntry: { ledger: ledgerResolver },
  DataEntryValues: { account: accountResolver },
  DataEntrySubscriptionPayload: { account: accountResolver },
  Subscription: {
    dataEntry: dataEntrySubscription(DATA_ENTRY)
  }
};
