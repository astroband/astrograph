import { AssetType } from "./asset_type";

export class Asset {
  public type: AssetType;
  public code: string;
  public issuer: string;

  constructor(type: number, code: string, issuer: string) {
    this.type = AssetType[type] as AssetType;
    this.code = code;
    this.issuer = issuer;
  }
}
