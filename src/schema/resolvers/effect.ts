import { IHorizonEffectData } from "../../datasource/types";
import { Effect, EffectKinds } from "../../model";
import { EffectFactory } from "../../model/factories";
import * as resolvers from "./shared";
import { makeConnection } from "./util";

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
    account: resolvers.account
  },
  Query: {
    effects: async (root: any, args: any, ctx: any, info: any) => {
      return makeConnection(await ctx.dataSources.horizon.getEffects(args), (r: IHorizonEffectData) =>
        EffectFactory.fromHorizon(r)
      );
    }
  }
};
