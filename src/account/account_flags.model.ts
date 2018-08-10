import stellar from "stellar-base";

export default class AccountFlags {
  public id: string;
  public authRequired: boolean;
  public authRevokable: boolean;
  public authImmutable: boolean;

  constructor(value: number) {
    this.authRequired = value & stellar.xdr.AccountFlags.authRequiredFlag();
    this.authRevokable = value & stellar.xdr.AccountFlags.authRevokableFlag();
    this.authImmutable = value & stellar.xdr.AccountFlags.authImmutableFlag();
  }
}
