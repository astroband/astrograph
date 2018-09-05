import { Asset } from "./asset";
import { IMutationType, MutationType } from "./mutation_type";

import { assetFromXDR, publicKeyFromXDR } from "../common/xdr";

export class TrustLineEventRemovePayload implements IMutationType {
  public static buildFromXDR(mutationType: MutationType, xdr: any): TrustLineEventRemovePayload {
    const { assettype, assetcode, issuer } = assetFromXDR(xdr);
    const asset = new Asset(assettype, assetcode, issuer);

    return new TrustLineEventRemovePayload(mutationType, asset, publicKeyFromXDR(xdr));
  }

  public accountID: string;
  public asset: Asset;
  public mutationType: MutationType;

  constructor(mutationType: MutationType, asset: Asset, id: string) {
    this.accountID = id;
    this.mutationType = mutationType;
    this.asset = asset;
  }
}
