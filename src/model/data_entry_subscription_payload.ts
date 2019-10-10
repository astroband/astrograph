import { publicKeyFromXDR } from "../util/xdr";
import { AccountID, DataEntryValues } from "./";
import { DataEntryValuesFactory } from "./factories/data_entry_values_factory";
import { IMutationType, MutationType } from "./mutation_type";

export class DataEntrySubscriptionPayload implements IMutationType {
  public account: AccountID;
  public mutationType: MutationType;
  public name: string;
  public values: DataEntryValues | null = null;

  constructor(mutationType: MutationType, xdr: any) {
    this.mutationType = mutationType;
    this.account = publicKeyFromXDR(xdr);
    this.name = xdr.dataName().toString();

    if (mutationType !== MutationType.Remove) {
      this.values = DataEntryValuesFactory.fromXDR(xdr);
    }
  }
}
