import { AccountID, AssetCode } from "./";

interface IAssetData {
  code: AssetCode;
  issuer: AccountID;
  totalSupply: string;
  circulatingSupply: string;
  holdersCount: string;
  unauthorizedHoldersCount: string;
  lastModifiedIn: number;
}

export class Asset {
  public readonly code: AssetCode;
  public readonly issuer: AccountID | null;
  public readonly totalSupply: string;
  public readonly circulatingSupply: string;
  public readonly holdersCount: string;
  public readonly unauthorizedHoldersCount: string;
  public readonly lastModifiedIn: number;

  constructor(data: IAssetData) {
    this.code = data.code;
    this.issuer = data.issuer;
    this.totalSupply = data.totalSupply;
    this.circulatingSupply = data.circulatingSupply;
    this.holdersCount = data.holdersCount;
    this.unauthorizedHoldersCount = data.unauthorizedHoldersCount;
    this.lastModifiedIn = data.lastModifiedIn;
  }

  public get native(): boolean {
    return this.code === "XLM" && this.issuer === null;
  }

  public get id() {
    return this.native ? "native" : `${this.code}-${this.issuer}`;
  }
}
