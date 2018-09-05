import { publicKeyFromXDR } from "../common/xdr";
import { DataEntryValues } from "./data_entry_values";
import { IMutationType, MutationType } from "./mutation_type";

export class DataEntrySubscriptionPayload implements IMutationType {
  public accountID: string;
  public mutationType: MutationType;
  public name: string;
  public values: DataEntryValues | null = null;

  constructor(mutationType: MutationType, xdr: any) {
    this.mutationType = mutationType;
    this.accountID = publicKeyFromXDR(xdr);
    this.name = xdr.dataName().toString();

    if (mutationType !== MutationType.Remove) {
      this.values = DataEntryValues.buildFromXDR(xdr);
    }
  }
}
