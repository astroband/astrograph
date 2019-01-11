import { AccountValues } from "./account_values";
import { AccountValuesFactory } from "./factories/account_values_factory";
import { IMutationType, MutationType } from "./mutation_type";

import { publicKeyFromXDR } from "../util/xdr";

export class AccountSubscriptionPayload implements IMutationType {
  public id: string;
  public mutationType: MutationType;
  public values: AccountValues | null = null;

  constructor(mutationType: MutationType, xdr: any) {
    this.mutationType = mutationType;
    this.id = publicKeyFromXDR(xdr);

    if (this.mutationType !== MutationType.Remove) {
      this.values = AccountValuesFactory.fromXDR(xdr);
    }
  }

  get accountID(): string {
    return this.id;
  }
}
