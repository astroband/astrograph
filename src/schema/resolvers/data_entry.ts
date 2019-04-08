import { withFilter } from "graphql-subscriptions";
import * as resolvers from "./shared";
import { eventMatches } from "./util";

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
  IDataEntry: { ledger: resolvers.ledger },
  DataEntry: { account: resolvers.account },
  DataEntryValues: { account: resolvers.account },
  DataEntrySubscriptionPayload: { account: resolvers.account },
  Subscription: {
    dataEntry: dataEntrySubscription(DATA_ENTRY)
  }
};
