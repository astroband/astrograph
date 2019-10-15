import { Asset } from "stellar-base";
import { HorizonOpType, IHorizonOperationData } from "../../../datasource/types";
import { parsePagingToken } from "../../../util/horizon";
import {
  IAccountMergeOperation,
  IAllowTrustOperation,
  IBaseOperation,
  IBumpSequenceOperation,
  IChangeTrustOperation,
  ICreateAccountOperation,
  ICreatePassiveSellOfferOperation,
  IInflationOperation,
  IManageDataOperation,
  IManageSellOfferOperation,
  IManageBuyOfferOperation,
  IPathPaymentOperation,
  IPaymentOperation,
  ISetOptionsOperation,
  Operation,
  OperationType
} from "../../operation";

export class DataMapper {
  public static call(data: IHorizonOperationData) {
    return new DataMapper(data).call();
  }

  public static mapHorizonOpType(type: HorizonOpType): OperationType {
    switch (type) {
      case "create_account":
        return OperationType.CreateAccount;
      case "payment":
        return OperationType.Payment;
      case "path_payment":
        return OperationType.PathPayment;
      case "manage_offer":
        return OperationType.ManageSellOffer;
      case "manage_buy_offer":
        return OperationType.ManageBuyOffer;
      case "create_passive_offer":
        return OperationType.CreatePassiveSellOffer;
      case "set_options":
        return OperationType.SetOption;
      case "change_trust":
        return OperationType.ChangeTrust;
      case "allow_trust":
        return OperationType.AllowTrust;
      case "account_merge":
        return OperationType.AccountMerge;
      case "manage_data":
        return OperationType.ManageData;
      case "bump_sequence":
        return OperationType.BumpSequence;
      case "inflation":
        return OperationType.Inflation;
    }
  }

  private baseData: IBaseOperation;

  constructor(private data: IHorizonOperationData) {
    this.baseData = {
      id: data.id,
      index: parsePagingToken(data.paging_token).opIndex,
      type: DataMapper.mapHorizonOpType(data.type),
      sourceAccount: data.source_account,
      dateTime: new Date(data.created_at),
      tx: { id: data.transaction_hash }
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
      case OperationType.ManageBuyOffer:
        return this.mapManageOffer();
      case OperationType.CreatePassiveSellOffer:
        return this.mapCreatePassiveOffer();
      case OperationType.PathPayment:
        return this.mapPathPayment();
      case OperationType.Inflation:
        return this.mapInflation();
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
        asset: new Asset(this.data.asset_code, this.baseData.sourceAccount)
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

  private mapCreatePassiveOffer(): ICreatePassiveSellOfferOperation {
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

  private mapManageOffer(): IManageSellOfferOperation | IManageBuyOfferOperation {
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
        offerId: this.data.offer_id.toString(),
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

  private mapInflation(): IInflationOperation {
    return this.baseData;
  }
}
