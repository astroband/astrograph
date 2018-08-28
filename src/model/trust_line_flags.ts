import stellar from "stellar-base";

export class TrustLineFlags {
  public authorized: boolean;

  constructor(value: number) {
    const fl = stellar.xdr.TrustLineFlags;

    this.authorized = (value & fl.authorizedFlag().value) > 0;
  }
}
