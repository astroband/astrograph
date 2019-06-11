import stellar from "stellar-base";
import { AccountID, BalanceValues } from ".";
import { publicKeyFromXDR } from "../util/xdr";
import { BalanceValuesFactory } from "./factories";
import { IMutationType, MutationType } from "./mutation_type";

export class BalanceSubscriptionPayload implements IMutationType {
  public account: AccountID;
  public asset: stellar.Asset;
  public mutationType: MutationType;
  public values: BalanceValues | null = null;

  constructor(mutationType: MutationType, xdr: any) {
    this.mutationType = mutationType;

    this.account = publicKeyFromXDR(xdr);
    this.asset = stellar.Asset.fromOperation(xdr.asset());

    if (this.mutationType !== MutationType.Remove) {
      this.values = BalanceValuesFactory.fromXDR(xdr);
    }
  }
}
