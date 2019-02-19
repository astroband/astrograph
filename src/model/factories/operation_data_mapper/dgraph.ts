import { Asset } from "stellar-sdk";
import { DgraphOperationsData, IAssetData } from "../../../storage/types";
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
} from "../../operation";

const accountIdPredicate = "account.id";
const assetIssuerPredicate = "asset.issuer";
const opDestinationPredicate = "op.destination";

export class DataMapper {
  public static call(data: DgraphOperationsData) {
    return new DataMapper(data).call();
  }

  private baseData: IBaseOperation;

  constructor(private data: DgraphOperationsData) {
    this.baseData = {
      kind: data["op.kind"],
      account: data["op.source"][accountIdPredicate],
      index: parseInt(data["op.index"], 10),
      dateTime: new Date(data["op.ledger"].close_time),
      transactionId: data["op.transaction"]["tx.id"]
    };
  }

  public call(): Operation {
    // I don't know, why I need casting here :(
    switch (this.data["op.kind"] as OperationKinds) {
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
    const assetData = this.data["payment_op.asset"];
    const asset = assetData.native
      ? Asset.native()
      : new Asset(assetData.code, assetData[assetIssuerPredicate][accountIdPredicate]);

    return {
      ...this.baseData,
      ...{
        destination: this.data[opDestinationPredicate][accountIdPredicate],
        source: this.data["op.source"][accountIdPredicate],
        amount: this.data.amount,
        asset
      }
    };
  }

  private mapAccountMerge(): IAccountMergeOperation {
    return {
      ...this.baseData,
      ...{
        destination: this.data[opDestinationPredicate][accountIdPredicate]
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
          high: parseInt(this.data.thresholds.high, 10),
          medium: parseInt(this.data.thresholds.med, 10),
          low: parseInt(this.data.thresholds.low, 10)
        },
        inflationDestination: this.data["set_options_op.inflation_destination"][accountIdPredicate],
        signer: {
          account: this.data["set_options_op.signer"].account[accountIdPredicate],
          weight: parseInt(this.data["set_options_op.signer"].weight, 10)
        }
      }
    };
  }

  private mapAllowTrust(): IAllowTrustOperation {
    const assetData = this.data["allow_trust_op.asset"];
    const asset = assetData.native
      ? Asset.native()
      : new Asset(assetData.code, assetData[assetIssuerPredicate][accountIdPredicate]);

    return {
      ...this.baseData,
      ...{
        trustor: this.data["allow_trust_op.trustor"][accountIdPredicate],
        authorize: this.data.authorize,
        asset
      }
    };
  }

  private mapBumpSequence(): IBumpSequenceOperation {
    return {
      ...this.baseData,
      ...{ bumpTo: this.data.bump_to }
    };
  }

  private mapChangeTrust(): IChangeTrustOperation {
    const assetData = this.data["change_trust_op.asset"];
    const asset = new Asset(assetData.code, assetData[assetIssuerPredicate][accountIdPredicate]);

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
        destination: this.data[opDestinationPredicate][accountIdPredicate]
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
    const assetBuyingData = this.data["manage_offer_op.asset_buying"];
    const assetSellingData = this.data["manage_offer_op.asset_selling"];

    const assetBuying = assetBuyingData.native
      ? Asset.native()
      : new Asset(assetBuyingData.code, assetBuyingData[assetIssuerPredicate][accountIdPredicate]);
    const assetSelling = assetSellingData.native
      ? Asset.native()
      : new Asset(assetSellingData.code, assetSellingData[assetIssuerPredicate][accountIdPredicate]);

    return {
      ...this.baseData,
      ...{
        offerId: this.data.offer_id,
        amount: this.data.amount,
        price: this.data.price,
        priceComponents: {
          n: this.data.price_n,
          d: this.data.price_d
        },
        assetBuying,
        assetSelling
      }
    };
  }

  private mapPathPayment(): IPathPaymentOperation {
    const destinationAssetData = this.data["path_payment_op.asset_destination"];
    const sourceAssetData = this.data["path_payment_op.asset_source"];

    const destinationAsset = destinationAssetData.native
      ? Asset.native()
      : new Asset(destinationAssetData.code, destinationAssetData[assetIssuerPredicate][accountIdPredicate]);
    const sourceAsset = sourceAssetData.native
      ? Asset.native()
      : new Asset(sourceAssetData.code, sourceAssetData[assetIssuerPredicate][accountIdPredicate]);

    return {
      ...this.baseData,
      ...{
        sendMax: this.data.send_max,
        destinationAmount: this.data.amount,
        destinationAccount: this.data[opDestinationPredicate][accountIdPredicate],
        destinationAsset,
        sourceAccount: this.data["op.source"][accountIdPredicate],
        sourceAsset,
        path: this.data["path_payment_op.assets_path"].map((assetData: IAssetData) => {
          return assetData.native
            ? Asset.native()
            : new Asset(assetData.code, assetData[assetIssuerPredicate][accountIdPredicate]);
        })
      }
    };
  }
}
