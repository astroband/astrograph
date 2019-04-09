import { Asset } from "stellar-sdk";
import { BalanceValues } from "./balance_values";
import { BalanceValuesFactory } from "./factories/balance_values_factory";
import { IMutationType, MutationType } from "./mutation_type";

import { publicKeyFromXDR } from "../util/xdr";

export class NativeBalanceSubscriptionPayload implements IMutationType {
  public mutationType: MutationType = MutationType.Update;
  public account: string;
  public values: BalanceValues | null = null;

  constructor(mutationType: MutationType, xdr: any) {
    this.mutationType = mutationType;

    this.account = publicKeyFromXDR(xdr);

    if (this.mutationType !== MutationType.Remove) {
      this.values = BalanceValuesFactory.fakeNativeFromXDR(xdr);
    }
  }

  get asset(): Asset {
    return Asset.native();
  }
}
