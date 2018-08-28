import { AssetType } from "./asset_type";

export class Asset {
  public type: string; // NOTE: Need to figure out how to work with enum relations
  public code: string;
  public issuer: string;

  constructor(type: number, code: string, issuer: string) {
    this.type = AssetType[type];
    this.code = code;
    this.issuer = issuer;
  }
}
