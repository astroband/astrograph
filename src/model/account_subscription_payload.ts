import { AccountValues } from "../model2";
import { AccountValuesFactory } from "../model2/factories";
import { publicKeyFromXDR } from "../util/xdr";
import { IMutationType, MutationType } from "./mutation_type";

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
