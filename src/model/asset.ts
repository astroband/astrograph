export class Asset {
  public native: boolean; // NOTE: Need to figure out how to work with enum relations
  public code: string;
  public issuer: string;

  constructor(native: boolean, code: string, issuer: string) {
    this.native = native;
    this.code = code;
    this.issuer = issuer;
  }
}
