import { AssetType } from "./asset_type";

// NOTE: Need to figure out enum relations
export class Asset {
  public type: string;
  public code: string;
  public issuer: string;

  constructor(type: number, code: string, issuer: string) {
    this.type = AssetType[type];
    this.code = code;
    this.issuer = issuer;
  }
}
