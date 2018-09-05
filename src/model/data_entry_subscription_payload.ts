import { IMutationType, MutationType } from "./payload_type";

import { publicKeyFromXDR } from "../common/xdr";

export class DataEntryEventRemovePayload implements IMutationType {
  public static buildFromXDR(mutationType: MutationType, xdr: any): DataEntryEventRemovePayload {
    return new DataEntryEventRemovePayload(mutationType, publicKeyFromXDR(xdr), xdr.dataName().toString());
  }

  public accountID: string;
  public mutationType: MutationType;
  public name: string;

  constructor(mutationType: MutationType, id: string, name: string) {
    this.accountID = id;
    this.mutationType = mutationType;
    this.name = name;
  }
}
