import stellar from "stellar-base";

export class AccountFlags {
  public authRequired: boolean;
  public authRevokable: boolean;
  public authImmutable: boolean;

  constructor(value: number) {
    const fl = stellar.xdr.AccountFlags;

    this.authRequired = (value & fl.authRequiredFlag().value) > 0;
    this.authRevokable = (value & fl.authRevocableFlag().value) > 0;
    this.authImmutable = (value & fl.authImmutableFlag().value) > 0;
  }

  public equals(other: AccountFlags): boolean {
    return (
      this.authRequired === other.authRequired &&
      this.authRevokable === other.authRevokable &&
      this.authImmutable === other.authImmutable
    );
  }
}
