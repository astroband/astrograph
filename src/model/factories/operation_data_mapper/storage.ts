import { IAccountFlagsOptionsData, IAsset, IOperationData, StorageOpType } from "../../../storage/types";
import {
  AccountFlagsOption,
  IAccountMergeOperation,
  IAllowTrustOperation,
  IBaseOperation,
  IBumpSequenceOperation,
  IChangeTrustOperation,
  ICreateAccountOperation,
  ICreatePassiveOfferOperation,
  IManageDataOperation,
  IManageOfferOperation,
  IPathPaymentOperation,
  IPaymentOperation,
  ISetOptionsOperation,
  Operation,
  OperationKinds
} from "../../operation";
import { AssetFactory } from "../asset_factory";

export class DataMapper {
  public static call(data: IOperationData) {
    return new DataMapper(data).call();
  }

  public static mapHorizonOpType(type: StorageOpType): OperationKinds {
    switch (type) {
      case "OperationTypeCreateAccount":
        return OperationKinds.CreateAccount;
      case "OperationTypePayment":
        return OperationKinds.Payment;
      case "OperationTypePathPayment":
        return OperationKinds.PathPayment;
      case "OperationTypeManageOffer":
        return OperationKinds.ManageOffer;
      case "OperationTypeCreatePassiveOffer":
        return OperationKinds.CreatePassiveOffer;
      case "OperationTypeSetOptions":
        return OperationKinds.SetOption;
      case "OperationTypeChangeTrust":
        return OperationKinds.ChangeTrust;
      case "OperationTypeAllowTrust":
        return OperationKinds.AllowTrust;
      case "OperationTypeAccountMerge":
        return OperationKinds.AccountMerge;
      case "OperationTypeManageData":
        return OperationKinds.ManageData;
      case "OperationTypeBumpSequence":
        return OperationKinds.BumpSequence;
    }
  }

  private baseData: IBaseOperation;

  constructor(private data: IOperationData) {
    this.baseData = {
      id: data.id,
      index: data.idx,
      kind: DataMapper.mapHorizonOpType(data.type),
      sourceAccount: data.source_account_id,
      dateTime: new Date(data.close_time),
      tx: { id: data.tx_id }
    };
  }

  public call(): Operation {
    switch (this.baseData.kind) {
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
      case OperationKinds.ChangeTrust:
        return this.mapChangeTrust();
      case OperationKinds.CreateAccount:
        return this.mapCreateAccount();
      case OperationKinds.ManageData:
        return this.mapManageData();
      case OperationKinds.ManageOffer:
        return this.mapManageOffer();
      case OperationKinds.CreatePassiveOffer:
        return this.mapCreatePassiveOffer();
      case OperationKinds.PathPayment:
        return this.mapPathPayment();
    }
  }

  private mapPayment(): IPaymentOperation {
    return {
      ...this.baseData,
      ...{
        destination: this.data.destination_account_id,
        amount: this.data.source_amount.toString(),
        asset: AssetFactory.fromStorage(this.data.source_asset)
      }
    };
  }

  private mapAccountMerge(): IAccountMergeOperation {
    return {
      ...this.baseData,
      ...{ destination: this.data.destination_account_id }
    };
  }

  private mapSetOption(): ISetOptionsOperation {
    return {
      ...this.baseData,
      ...{
        masterWeight: this.data.thresholds.master,
        homeDomain: this.data.home_domain,
        clearFlags: this.mapAccountFlagOptions(this.data.clear_flags),
        setFlags: this.mapAccountFlagOptions(this.data.set_flags),
        thresholds: {
          high: this.data.thresholds.high,
          medium: this.data.thresholds.medium,
          low: this.data.thresholds.low
        },
        inflationDestination: this.data.inflation_dest,
        signer: {
          account: this.data.signer.key,
          weight: this.data.signer.weight
        }
      }
    };
  }

  private mapAllowTrust(): IAllowTrustOperation {
    return {
      ...this.baseData,
      ...{
        trustor: this.data.destination_account_id,
        authorize: this.data.authorize,
        asset: AssetFactory.fromStorage(this.data.destination_asset)
      }
    };
  }

  private mapBumpSequence(): IBumpSequenceOperation {
    return {
      ...this.baseData,
      ...{ bumpTo: parseInt(this.data.bump_to, 10) }
    };
  }

  private mapChangeTrust(): IChangeTrustOperation {
    return {
      ...this.baseData,
      ...{
        limit: this.data.destination_amount.toString(),
        asset: AssetFactory.fromStorage(this.data.destination_asset)
      }
    };
  }

  private mapCreateAccount(): ICreateAccountOperation {
    return {
      ...this.baseData,
      ...{
        startingBalance: this.data.source_amount.toString(),
        destination: this.data.destination_account_id
      }
    };
  }

  private mapManageData(): IManageDataOperation {
    return {
      ...this.baseData,
      ...{ name: this.data.data.name, value: this.data.data.value }
    };
  }

  private mapCreatePassiveOffer(): ICreatePassiveOfferOperation {
    return {
      ...this.baseData,
      ...{
        amount: this.data.source_amount.toString(),
        price: this.data.offer_price.toString(),
        priceComponents: {
          n: this.data.offer_price_n_d.n,
          d: this.data.offer_price_n_d.d
        },
        assetBuying: AssetFactory.fromStorage(this.data.source_asset),
        assetSelling: AssetFactory.fromStorage(this.data.destination_asset)
      }
    };
  }

  private mapManageOffer(): IManageOfferOperation {
    return {
      ...this.baseData,
      ...{
        offerId: (this.data.offer_id || 0).toString(),
        amount: this.data.source_amount || "0",
        price: this.data.offer_price.toString(),
        priceComponents: {
          n: this.data.offer_price_n_d.n,
          d: this.data.offer_price_n_d.d
        },
        assetBuying: AssetFactory.fromStorage(this.data.source_asset),
        assetSelling: AssetFactory.fromStorage(this.data.destination_asset)
      }
    };
  }

  private mapPathPayment(): IPathPaymentOperation {
    return {
      ...this.baseData,
      ...{
        sendMax: this.data.source_amount.toString(),
        destinationAmount: this.data.destination_amount.toString(),
        destinationAccount: this.data.destination_account_id,
        destinationAsset: AssetFactory.fromStorage(this.data.destination_asset),
        sourceAsset: AssetFactory.fromStorage(this.data.source_asset),
        path: this.data.path.map((node: IAsset) => {
          return AssetFactory.fromStorage(node);
        })
      }
    };
  }

  private mapAccountFlagOptions(data: IAccountFlagsOptionsData) {
    const result: AccountFlagsOption[] = [];

    if (data.required) {
      result.push("authRequired");
    }

    if (data.revocable) {
      result.push("authRevocable");
    }

    if (data.immutable) {
      result.push("authImmutable");
    }

    return result;
  }
}
