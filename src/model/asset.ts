import { AccountID, AssetCode } from "./";
import { AccountFlagsFactory } from "./factories";

interface IAssetData {
  code: AssetCode;
  issuer: AccountID;
  totalSupply: string;
  circulatingSupply: string;
  holdersCount: string;
  unauthorizedHoldersCount: string;
  lastModifiedIn: number;
  flags: number;
}

export class Asset {
  public static readonly NATIVE_ID = "native";
  public readonly code: AssetCode;
  public readonly issuer: AccountID | null;
  public readonly totalSupply: string;
  public readonly circulatingSupply: string;
  public readonly holdersCount: string;
  public readonly unauthorizedHoldersCount: string;
  public readonly lastModifiedIn: number;
  public readonly authRequired: boolean;
  public readonly authRevocable: boolean;
  public readonly authImmutable: boolean;

  constructor(data: IAssetData) {
    this.code = data.code;
    this.issuer = data.issuer;
    this.totalSupply = data.totalSupply;
    this.circulatingSupply = data.circulatingSupply;
    this.holdersCount = data.holdersCount;
    this.unauthorizedHoldersCount = data.unauthorizedHoldersCount;
    this.lastModifiedIn = data.lastModifiedIn;

    const parsedFlags = AccountFlagsFactory.fromValue(data.flags);
    this.authRequired = parsedFlags.authRequired;
    this.authRevocable = parsedFlags.authRevocable;
    this.authImmutable = parsedFlags.authImmutable;
  }

  public get native(): boolean {
    return this.code === "XLM" && this.issuer === null;
  }

  public get id() {
    return this.native ? "native" : `${this.code}-${this.issuer}`;
  }

  public get paging_token() {
    return this.id;
  }
}
