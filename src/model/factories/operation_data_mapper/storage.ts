import { IAccountFlagsOptionsData, IAsset, IOperationData, StorageOpType } from "../../../storage/types";
import { AssetFactory } from "../asset_factory";

import {
  AccountFlagsOption,
  IAccountMergeOperation,
  IAllowTrustOperation,
  IBaseOperation,
  IBumpSequenceOperation,
  IChangeTrustOperation,
  ICreateAccountOperation,
  ICreatePassiveSellOfferOperation,
  IManageBuyOfferOperation,
  IManageDataOperation,
  IManageSellOfferOperation,
  IPathPaymentOperation,
  IPaymentOperation,
  ISetOptionsOperation,
  Operation,
  OperationType
} from "../../operation";

export class DataMapper {
  public static call(data: IOperationData) {
    return new DataMapper(data).call();
  }

  public static mapStorageOpType(type: StorageOpType): OperationType {
    switch (type) {
      case "CreateAccount":
        return OperationType.CreateAccount;
      case "Payment":
        return OperationType.Payment;
      case "PathPayment":
        return OperationType.PathPayment;
      case "ManageSellOffer":
        return OperationType.ManageSellOffer;
      case "ManageBuyOffer":
        return OperationType.ManageBuyOffer;
      case "CreatePassiveSellOffer":
        return OperationType.CreatePassiveSellOffer;
      case "SetOptions":
        return OperationType.SetOption;
      case "ChangeTrust":
        return OperationType.ChangeTrust;
      case "AllowTrust":
        return OperationType.AllowTrust;
      case "AccountMerge":
        return OperationType.AccountMerge;
      case "ManageData":
        return OperationType.ManageData;
      case "BumpSequence":
        return OperationType.BumpSequence;
    }
  }

  public static mapOperationType(type: OperationType): StorageOpType {
    switch (type) {
      case OperationType.CreateAccount:
        return "CreateAccount";
      case OperationType.Payment:
        return "Payment";
      case OperationType.PathPayment:
        return "PathPayment";
      case OperationType.ManageSellOffer:
        return "ManageSellOffer";
      case OperationType.ManageBuyOffer:
        return "ManageBuyOffer";
      case OperationType.CreatePassiveSellOffer:
        return "CreatePassiveSellOffer";
      case OperationType.SetOption:
        return "SetOptions";
      case OperationType.ChangeTrust:
        return "ChangeTrust";
      case OperationType.AllowTrust:
        return "AllowTrust";
      case OperationType.AccountMerge:
        return "AccountMerge";
      case OperationType.ManageData:
        return "ManageData";
      case OperationType.BumpSequence:
        return "BumpSequence";
    }
  }

  private baseData: IBaseOperation;

  constructor(private data: IOperationData) {
    this.baseData = {
      id: data.id,
      index: data.idx,
      type: DataMapper.mapStorageOpType(data.type),
      sourceAccount: data.source_account_id,
      dateTime: new Date(data.close_time),
      tx: { id: data.tx_id }
    };
  }

  public call(): Operation {
    switch (this.baseData.type) {
      case OperationType.Payment:
        return this.mapPayment();
      case OperationType.SetOption:
        return this.mapSetOption();
      case OperationType.AccountMerge:
        return this.mapAccountMerge();
      case OperationType.AllowTrust:
        return this.mapAllowTrust();
      case OperationType.BumpSequence:
        return this.mapBumpSequence();
      case OperationType.ChangeTrust:
        return this.mapChangeTrust();
      case OperationType.CreateAccount:
        return this.mapCreateAccount();
      case OperationType.ManageData:
        return this.mapManageData();
      case OperationType.ManageSellOffer:
        return this.mapManageOffer();
      case OperationType.ManageBuyOffer:
        return this.mapManageOffer();
      case OperationType.CreatePassiveSellOffer:
        return this.mapCreatePassiveSellOffer();
      case OperationType.PathPayment:
        return this.mapPathPayment();
    }
  }

  private mapPayment(): IPaymentOperation {
    return {
      ...this.baseData,
      ...{
        destination: this.data.destination_account_id,
        amount: this.data.source_amount.toString(),
        asset: AssetFactory.fromId(this.data.source_asset.key)
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
        asset: AssetFactory.fromId(this.data.destination_asset.key)
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
        asset: AssetFactory.fromId(this.data.destination_asset.key)
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

  private mapCreatePassiveSellOffer(): ICreatePassiveSellOfferOperation {
    return {
      ...this.baseData,
      ...{
        amount: this.data.source_amount.toString(),
        price: this.data.offer_price.toString(),
        priceComponents: {
          n: this.data.offer_price_n_d.n,
          d: this.data.offer_price_n_d.d
        },
        assetBuying: AssetFactory.fromId(this.data.source_asset.key),
        assetSelling: AssetFactory.fromId(this.data.destination_asset.key)
      }
    };
  }

  private mapManageOffer(): IManageSellOfferOperation | IManageBuyOfferOperation {
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
        assetBuying: AssetFactory.fromId(this.data.source_asset.key),
        assetSelling: AssetFactory.fromId(this.data.destination_asset.key)
      }
    };
  }

  private mapPathPayment(): IPathPaymentOperation {
    return {
      ...this.baseData,
      ...{
        sendMax: this.data.source_amount,
        amountReceived: this.data.amount_received,
        amountSent: this.data.amount_sent,
        destinationAccount: this.data.destination_account_id,
        destinationAsset: AssetFactory.fromId(this.data.destination_asset.key),
        sourceAsset: AssetFactory.fromId(this.data.source_asset.key),
        path: this.data.path.map((node: IAsset) => AssetFactory.fromId(node.key))
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
