import { IHorizonEffectData } from "../../datasource/types";
import { IApolloContext } from "../../graphql_server";
import { Effect, EffectType } from "../../model";
import { EffectFactory } from "../../model/factories";
import * as resolvers from "./shared";
import { makeConnection } from "./util";

export default {
  Effect: {
    __resolveType(effect: Effect) {
      switch (effect.type) {
        case EffectType.AccountCreated:
          return "AccountCreatedEffect";
        case EffectType.AccountRemoved:
          return "AccountRemovedEffect";
        case EffectType.AccountCredited:
          return "AccountCreditedEffect";
        case EffectType.AccountDebited:
          return "AccountDebitedEffect";
        case EffectType.AccountThresholdsUpdated:
          return "AccountThresholdsUpdatedEffect";
        case EffectType.AccountHomeDomainUpdated:
          return "AccountHomeDomainUpdatedEffect";
        case EffectType.AccountFlagsUpdated:
          return "AccountFlagsUpdatedEffect";
        case EffectType.AccountInflationDestinationUpdated:
          return "AccountInflationDestinationUpdatedEffect";
        case EffectType.SignerCreated:
          return "SignerCreatedEffect";
        case EffectType.SignerRemoved:
          return "SignerRemovedEffect";
        case EffectType.SignerUpdated:
          return "SignerUpdatedEffect";
        case EffectType.TrustlineCreated:
          return "TrustlineCreatedEffect";
        case EffectType.TrustlineRemoved:
          return "TrustlineRemovedEffect";
        case EffectType.TrustlineUpdated:
          return "TrustlineUpdatedEffect";
        case EffectType.TrustlineAuthorized:
          return "TrustlineAuthorizedEffect";
        case EffectType.TrustlineDeauthorized:
          return "TrustlineDeauthorizedEffect";
        case EffectType.OfferCreated:
          return "OfferCreatedEffect";
        case EffectType.OfferRemoved:
          return "OfferRemovedEffect";
        case EffectType.OfferUpdated:
          return "OfferUpdatedEffect";
        case EffectType.Trade:
          return "TradeEffect";
        case EffectType.DataCreated:
          return "DataCreatedEffect";
        case EffectType.DataRemoved:
          return "DataRemovedEffect";
        case EffectType.DataUpdated:
          return "DataUpdatedEffect";
        case EffectType.SequenceBumped:
          return "SequenceBumpedEffect";
        default:
          return null;
      }
    },
    account: resolvers.account
  },
  Query: {
    effects: async (root: any, args: any, ctx: IApolloContext, info: any) => {
      return makeConnection(await ctx.dataSources.effects.all(args), (r: IHorizonEffectData) =>
        EffectFactory.fromHorizon(r)
      );
    }
  }
};
