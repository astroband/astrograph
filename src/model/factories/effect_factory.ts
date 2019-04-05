import { IHorizonEffectData } from "../../datasource/types";
import { Effect, EffectKinds } from "../effect";
import { AssetFactory } from "./asset_factory";

export class EffectFactory {
  public static fromHorizon(data: IHorizonEffectData): Effect {
    const baseData = {
      id: data.id,
      account: data.account,
      kind: data.type.replace(/_([a-z])/g, g => g[1].toUpperCase()) as EffectKinds,
      createdAt: new Date(data.created_at)
    };

    switch (baseData.kind) {
      case EffectKinds.AccountCreated:
        return { ...baseData, startingBalance: data.starting_balance };
      case EffectKinds.AccountCredited:
      case EffectKinds.AccountDebited:
        return { ...baseData, amount: data.amount };
      case EffectKinds.AccountThresholdsUpdated:
        return {
          ...baseData,
          lowThreshold: data.low_threshold,
          medThreshold: data.med_threshold,
          highThreshold: data.high_threshold
        };
      case EffectKinds.AccountHomeDomainUpdated:
        return { ...baseData, homeDomain: data.home_domain };
      case EffectKinds.AccountFlagsUpdated:
        return { ...baseData, authRequiredFlag: data.auth_required_flag, authRevokableFlag: data.auth_revokable_flag };
      case EffectKinds.SignerCreated:
      case EffectKinds.SignerUpdated:
      case EffectKinds.SignerRemoved:
        return {
          ...baseData,
          weight: data.weight,
          publicKey: data.public_key,
          key: data.key
        };
      case EffectKinds.TrustlineCreated:
      case EffectKinds.TrustlineUpdated:
      case EffectKinds.TrustlineRemoved:
        return {
          ...baseData,
          asset: AssetFactory.fromHorizonResponse(data.asset_type, data.asset_code, data.asset_issuer),
          limit: data.limit
        };
      case EffectKinds.TrustlineAuthorized:
      case EffectKinds.TrustlineDeauthorized:
        return {
          ...baseData,
          asset: AssetFactory.fromHorizonResponse(data.asset_type, data.asset_code, data.asset_issuer),
          trustor: data.trustor
        };
      case EffectKinds.Trade:
        return {
          ...baseData,
          seller: data.seller,
          offerId: data.offer_id,
          soldAmount: data.sold_amount,
          soldAsset: AssetFactory.fromHorizonResponse(
            data.sold_asset_type,
            data.sold_asset_code,
            data.sold_asset_issuer
          ),
          boughtAmount: data.bought_amount,
          boughtAsset: AssetFactory.fromHorizonResponse(
            data.bought_asset_type,
            data.bought_asset_code,
            data.bought_asset_issuer
          )
        };
      case EffectKinds.SequenceBumped:
        return { ...baseData, newSeq: data.new_seq };
      default:
        return baseData;
    }
  }
}
