import { publicKeyFromXDR } from "../util/xdr";
import { AccountValues } from "./account_values";
import { IMutationType, MutationType } from "./mutation_type";

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

  get accountID(): string {
    return this.id;
  }
}
