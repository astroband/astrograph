import { IHorizonEffectData } from "../../datasource/types";
import { Effect, EffectType } from "../effect";
import { AssetFactory } from "./asset_factory";

export class EffectFactory {
  public static fromHorizon(data: IHorizonEffectData): Effect {
    const baseData = {
      id: data.id,
      account: data.account,
      type: data.type.replace(/_([a-z])/g, g => g[1].toUpperCase()) as EffectType,
      createdAt: new Date(data.created_at)
    };

    switch (baseData.type) {
      case EffectType.AccountCreated:
        return { ...baseData, startingBalance: data.starting_balance };
      case EffectType.AccountCredited:
      case EffectType.AccountDebited:
        return { ...baseData, amount: data.amount };
      case EffectType.AccountThresholdsUpdated:
        return {
          ...baseData,
          lowThreshold: data.low_threshold,
          medThreshold: data.med_threshold,
          highThreshold: data.high_threshold
        };
      case EffectType.AccountHomeDomainUpdated:
        return { ...baseData, homeDomain: data.home_domain };
      case EffectType.AccountFlagsUpdated:
        return { ...baseData, authRequiredFlag: data.auth_required_flag, authRevocableFlag: data.auth_revokable_flag };
      case EffectType.SignerCreated:
      case EffectType.SignerUpdated:
      case EffectType.SignerRemoved:
        return {
          ...baseData,
          weight: data.weight,
          publicKey: data.public_key,
          key: data.key
        };
      case EffectType.TrustlineCreated:
      case EffectType.TrustlineUpdated:
      case EffectType.TrustlineRemoved:
        return {
          ...baseData,
          asset: AssetFactory.fromHorizon(data.asset_type, data.asset_code, data.asset_issuer),
          limit: data.limit
        };
      case EffectType.TrustlineAuthorized:
      case EffectType.TrustlineDeauthorized:
        return {
          ...baseData,
          asset: AssetFactory.fromHorizon(data.asset_type, data.asset_code, data.asset_issuer),
          trustor: data.trustor
        };
      case EffectType.Trade:
        return {
          ...baseData,
          seller: data.seller,
          offerId: data.offer_id,
          soldAmount: data.sold_amount,
          soldAsset: AssetFactory.fromHorizon(data.sold_asset_type, data.sold_asset_code, data.sold_asset_issuer),
          boughtAmount: data.bought_amount,
          boughtAsset: AssetFactory.fromHorizon(
            data.bought_asset_type,
            data.bought_asset_code,
            data.bought_asset_issuer
          )
        };
      case EffectType.SequenceBumped:
        return { ...baseData, newSeq: data.new_seq };
      default:
        return baseData;
    }
  }
}
