import { Asset } from "stellar-sdk";
import { DgraphOperationsData } from "../../types";
import {
  IAccountMergeOperation,
  IAllowTrustOperation,
  IBaseOperation,
  IBumpSequenceOperation,
  IPaymentOperation,
  ISetOptionsOperation,
  Operation,
  OperationKinds
} from "./types";

export class DataMapper {
  public static call(data: DgraphOperationsData) {
    return new DataMapper(data).call();
  }

  private baseData: IBaseOperation;

  constructor(private data: DgraphOperationsData) {
    this.baseData = {
      kind: data.kind,
      account: data["account.source"][0].id,
      index: parseInt(data.index, 10),
      dateTime: new Date(data.ledger[0].close_time),
      transactionId: data.transaction[0].id
    };
  }

  public call(): Operation {
    switch (this.data.kind) {
      case OperationKinds.Payment:
        return this.mapPayment();
      case OperationKinds.SetOption:
        return this.mapSetOption();
      case OperationKinds.AccountMerge:
        return this.mapAccountMerge();
      case OperationKinds.AllowTrust:
        return this.mapAllowTrust();
      case OperationKinds.BumpSequence:
        return this.mapBumpSequence();
    }
  }

  private mapPayment(): IPaymentOperation {
    const assetData = this.data.asset[0];
    const asset = assetData.native ? Asset.native() : new Asset(assetData.code, assetData.issuer[0].id);

    return {
      ...this.baseData,
      ...{
        destination: this.data["account.destination"][0].id,
        source: this.data["account.source"][0].id,
        amount: this.data.amount,
        asset
      }
    };
  }

  private mapAccountMerge(): IAccountMergeOperation {
    return {
      ...this.baseData,
      ...{
        destination: this.data["account.destination"][0].id
      }
    };
  }

  private mapSetOption(): ISetOptionsOperation {
    // in case of undefined input `parseInt` returns NaN,
    // which will be returned as `null` by Apollo server,
    // so additional checks are not necessary
    return {
      ...this.baseData,
      ...{
        masterWeight: parseInt(this.data.master_weight, 10),
        homeDomain: this.data.home_domain,
        clearFlags: parseInt(this.data.clear_flags, 10),
        setFlags: parseInt(this.data.set_flags, 10),
        thresholds: {
          high: parseInt(this.data.thresholds[0].high, 10),
          medium: parseInt(this.data.thresholds[0].med, 10),
          low: parseInt(this.data.thresholds[0].low, 10)
        },
        inflationDestination: this.data["account.inflation_dest"][0].id,
        signer: {
          account: this.data.signer[0].account[0].id,
          weight: parseInt(this.data.signer[0].weight, 10)
        }
      }
    };
  }

  private mapAllowTrust(): IAllowTrustOperation {
    return {
      ...this.baseData,
      ...{
        trustor: this.data.trustor[0].id,
        authorize: this.data.authorize,
        assetCode: this.data.asset_code
      }
    };
  }

  private mapBumpSequence(): IBumpSequenceOperation {
    return {
      ...this.baseData,
      ...{ bumpTo: this.data.bump_to }
    };
  }
}
