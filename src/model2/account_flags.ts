import stellar from "stellar-base";

export interface IAccountFlags {
  authRequired: boolean;
  authRevokable: boolean;
  authImmutable: boolean;
}

export class AccountFlags implements IAccountFlags {
  public static fromValue(value: number): AccountFlags {
    const fl = stellar.xdr.AccountFlags;

    const data: IAccountFlags = {
      authRequired: (value & fl.authRequiredFlag().value) > 0,
      authRevokable: (value & fl.authRevocableFlag().value) > 0,
      authImmutable: (value & fl.authImmutableFlag().value) > 0
    };

    return new AccountFlags(data);
  }

  public authRequired: boolean;
  public authRevokable: boolean;
  public authImmutable: boolean;

  constructor(data: IAccountFlags) {
    this.authRequired = data.authRequired;
    this.authRevokable = data.authRevokable;
    this.authImmutable = data.authImmutable;
  }

  public equals(other: IAccountFlags): boolean {
    return (
      this.authRequired === other.authRequired &&
      this.authRevokable === other.authRevokable &&
      this.authImmutable === other.authImmutable
    );
  }
}
