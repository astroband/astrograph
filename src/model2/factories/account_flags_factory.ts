import stellar from "stellar-base";
import { AccountFlags, IAccountFlags } from "..";

export class AccountFlagsFactory {
  public static fromValue(value: number): AccountFlags {
    const fl = stellar.xdr.AccountFlags;

    const data: IAccountFlags = {
      authRequired: (value & fl.authRequiredFlag().value) > 0,
      authRevokable: (value & fl.authRevocableFlag().value) > 0,
      authImmutable: (value & fl.authImmutableFlag().value) > 0
    };

    return new AccountFlags(data);
  }
}
