import { IMutationType, MutationType } from "./mutation_type";

import { publicKeyFromXDR } from "../common/xdr";

export class AccountEventRemovePayload implements IMutationType {
  public static buildFromXDR(mutationType: MutationType, xdr: any): AccountEventRemovePayload {
    return new AccountEventRemovePayload(mutationType, publicKeyFromXDR(xdr));
  }

  public accountID: string;
  public mutationType: MutationType;

  constructor(mutationType: MutationType, id: string) {
    this.accountID = id;
    this.mutationType = mutationType;
  }
}
