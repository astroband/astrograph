import { Asset } from "stellar-sdk";
import { HorizonOperationData, HorizonOpType } from "../../../datasource/types";
import {
  IAccountMergeOperation,
  IAllowTrustOperation,
  IBaseOperation,
  IBumpSequenceOperation,
  IChangeTrustOperation,
  ICreateAccountOperation,
  IManageDataOperation,
  IManageOfferOperation,
  IPathPaymentOperation,
  IPaymentOperation,
  ISetOptionsOperation,
  Operation,
  OperationKinds
} from "../../horizon_operation";

export class DataMapper {
  public static call(data: HorizonOperationData) {
    return new DataMapper(data).call();
  }

  public static mapHorizonOpType(type: HorizonOpType): OperationKinds {
    switch (type) {
      case "create_account":
        return OperationKinds.CreateAccount;
      case "payment":
        return OperationKinds.Payment;
      case "path_payment":
        return OperationKinds.PathPayment;
      case "manage_offer":
        return OperationKinds.ManageOffer;
      case "set_options":
        return OperationKinds.SetOption;
      case "change_trust":
        return OperationKinds.ChangeTrust;
      case "allow_trust":
        return OperationKinds.AllowTrust;
      case "account_merge":
        return OperationKinds.AccountMerge;
      case "manage_data":
        return OperationKinds.ManageData;
      case "bump_sequence":
        return OperationKinds.BumpSequence;
    }
  }

  private baseData: IBaseOperation;

  constructor(private data: HorizonOperationData) {
    this.baseData = {
      id: data.id,
      kind: DataMapper.mapHorizonOpType(data.type),
      account: data.source_account,
      dateTime: new Date(data.created_at),
      transactionId: data.transaction_hash
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
      case OperationKinds.PathPayment:
        return this.mapPathPayment();
    }
  }

  private mapPayment(): IPaymentOperation {
    const asset =
      this.data.asset_type === "native" ? Asset.native() : new Asset(this.data.asset_code, this.data.asset_issuer);

    return {
      ...this.baseData,
      ...{
        destination: this.data.to,
        source: this.data.from,
        amount: this.data.amount,
        asset
      }
    };
  }

  private mapAccountMerge(): IAccountMergeOperation {
    return {
      ...this.baseData,
      ...{ destination: this.data.into }
    };
  }

  private mapSetOption(): ISetOptionsOperation {
    return {
      ...this.baseData,
      ...{
        masterWeight: this.data.master_key_weight,
        homeDomain: this.data.home_domain,
        clearFlags: this.data.clear_flags_s,
        setFlags: this.data.set_flags_s,
        thresholds: {
          high: this.data.high_threshold,
          medium: this.data.med_threshold,
          low: this.data.low_threshold
        },
        inflationDestination: this.data.inflation_dest,
        signer: {
          account: this.data.signer_key,
          weight: this.data.signer_weight
        }
      }
    };
  }

  private mapAllowTrust(): IAllowTrustOperation {
    return {
      ...this.baseData,
      ...{
        trustor: this.data.trustor,
        authorize: this.data.authorize,
        assetCode: this.data.asset_code
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
    const asset = new Asset(this.data.asset_code, this.data.asset_issuer);

    return {
      ...this.baseData,
      ...{ limit: this.data.limit, asset }
    };
  }

  private mapCreateAccount(): ICreateAccountOperation {
    return {
      ...this.baseData,
      ...{
        startingBalance: this.data.starting_balance,
        destination: this.data.account
      }
    };
  }

  private mapManageData(): IManageDataOperation {
    return {
      ...this.baseData,
      ...{ name: this.data.name, value: this.data.value }
    };
  }

  private mapManageOffer(): IManageOfferOperation {
    const assetBuying =
      this.data.buying_asset_type === "native"
        ? Asset.native()
        : new Asset(this.data.buying_asset_code, this.data.buying_asset_issuer);

    const assetSelling =
      this.data.selling_asset_type === "native"
        ? Asset.native()
        : new Asset(this.data.selling_asset_code, this.data.selling_asset_issuer);

    return {
      ...this.baseData,
      ...{
        offerId: this.data.offer_id,
        amount: this.data.amount,
        price: this.data.price,
        priceComponents: {
          n: this.data.price_r.n,
          d: this.data.price_r.d
        },
        assetBuying,
        assetSelling
      }
    };
  }

  private mapPathPayment(): IPathPaymentOperation {
    const destinationAsset =
      this.data.asset_type === "native" ? Asset.native() : new Asset(this.data.asset_code, this.data.asset_issuer);
    const sourceAsset =
      this.data.source_asset_type === "native"
        ? Asset.native()
        : new Asset(this.data.source_asset_code, this.data.source_asset_issuer);

    return {
      ...this.baseData,
      ...{
        sendMax: this.data.source_max,
        amountSent: this.data.source_amount,
        amountReceived: this.data.amount,
        destinationAccount: this.data.to,
        destinationAsset,
        sourceAccount: this.data.from,
        sourceAsset
      }
    };
  }
}
