import { IHorizonEffectData } from "../../datasource/types";
import { Effect, EffectKinds } from "../../model";
import { EffectFactory } from "../../model/factories";
import { accountResolver } from "./util";

export default {
  Effect: {
    __resolveType(effect: Effect) {
      switch (effect.kind) {
        case EffectKinds.AccountCreated:
          return "AccountCreatedEffect";
        case EffectKinds.AccountRemoved:
          return "AccountRemovedEffect";
        case EffectKinds.AccountCredited:
          return "AccountCreditedEffect";
        case EffectKinds.AccountDebited:
          return "AccountDebitedEffect";
        case EffectKinds.AccountThresholdsUpdated:
          return "AccountThresholdsUpdatedEffect";
        case EffectKinds.AccountHomeDomainUpdated:
          return "AccountHomeDomainUpdatedEffect";
        case EffectKinds.AccountFlagsUpdated:
          return "AccountFlagsUpdatedEffect";
        case EffectKinds.AccountInflationDestinationUpdated:
          return "AccountInflationDestinationUpdatedEffect";
        case EffectKinds.SignerCreated:
          return "SignerCreatedEffect";
        case EffectKinds.SignerRemoved:
          return "SignerRemovedEffect";
        case EffectKinds.SignerUpdated:
          return "SignerUpdatedEffect";
        case EffectKinds.TrustlineCreated:
          return "TrustlineCreatedEffect";
        case EffectKinds.TrustlineRemoved:
          return "TrustlineRemovedEffect";
        case EffectKinds.TrustlineUpdated:
          return "TrustlineUpdatedEffect";
        case EffectKinds.TrustlineAuthorized:
          return "TrustlineAuthorizedEffect";
        case EffectKinds.TrustlineDeauthorized:
          return "TrustlineDeauthorizedEffect";
        case EffectKinds.OfferCreated:
          return "OfferCreatedEffect";
        case EffectKinds.OfferRemoved:
          return "OfferRemovedEffect";
        case EffectKinds.OfferUpdated:
          return "OfferUpdatedEffect";
        case EffectKinds.Trade:
          return "TradeEffect";
        case EffectKinds.DataCreated:
          return "DataCreatedEffect";
        case EffectKinds.DataRemoved:
          return "DataRemovedEffect";
        case EffectKinds.DataUpdated:
          return "DataUpdatedEffect";
        case EffectKinds.SequenceBumped:
          return "SequenceBumpedEffect";
        default:
          return null;
      }
    },
    account: accountResolver
  },
  Query: {
    async effects(root: any, args: any, ctx: any, info: any) {
      const { first, last, after, before } = args;
      let records: IHorizonEffectData[] = await ctx.dataSources.horizon.getEffects(
        first || last,
        last ? "asc" : "desc",
        last ? before : after
      );

      // we must keep descending ordering, because Horizon doesn't do it,
      // when you request the previous page
      if (last) {
        records = records.reverse();
      }

      const edges = records.map(record => {
        return {
          node: EffectFactory.fromHorizon(record),
          cursor: record.paging_token
        };
      });

      return {
        nodes: edges.map(edge => edge.node),
        edges,
        pageInfo: {
          startCursor: records.length !== 0 ? records[0].paging_token : null,
          endCursor: records.length !== 0 ? records[records.length - 1].paging_token : null
        }
      };
    }
  }
};
