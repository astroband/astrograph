import { AccountValues } from "./account_values";
import { IMutationType, MutationType } from "./mutation_type";
import { publicKeyFromXDR } from "../common/xdr";

export class AccountSubscriptionPayload implements IMutationType {
  public id: string;
  public mutationType: MutationType;
  public values: AccountValues | null = null;

  constructor(mutationType: MutationType, xdr: any) {
    this.mutationType = mutationType;
    this.id = publicKeyFromXDR(xdr);

    if (this.mutationType !== MutationType.Remove) {
      this.values = AccountValues.buildFromXDR(xdr);
    }
  }
}
