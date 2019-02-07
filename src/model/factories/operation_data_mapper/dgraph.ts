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

export class DataMapper {
  public static call(data: DgraphOperationsData) {
    return new DataMapper(data).call();
  }

  private baseData: IBaseOperation;

  constructor(private data: DgraphOperationsData) {
    this.baseData = {
      kind: data["op.kind"],
      account: data["op.source"][0]["account.id"],
      index: parseInt(data["op.index"], 10),
      dateTime: new Date(data["op.ledger"][0].close_time),
      transactionId: data["op.transaction"][0]["tx.id"]
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
    const assetData = this.data["payment_op.asset"][0];
    const asset = assetData.native
      ? Asset.native()
      : new Asset(assetData.code, assetData["asset.issuer"][0]["account.id"]);

    return {
      ...this.baseData,
      ...{
        destination: this.data["op.destination"][0]["account.id"],
        source: this.data["op.source"][0]["account.id"],
        amount: this.data.amount,
        asset
      }
    };
  }

  private mapAccountMerge(): IAccountMergeOperation {
    return {
      ...this.baseData,
      ...{
        destination: this.data["op.destination"][0]["account.id"]
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
        inflationDestination: this.data["set_options_op.inflation_destination"][0]["account.id"],
        signer: {
          account: this.data["set_options_op.signer"][0].account[0]["account.id"],
          weight: parseInt(this.data["set_options_op.signer"][0].weight, 10)
        }
      }
    };
  }

  private mapAllowTrust(): IAllowTrustOperation {
    const assetData = this.data["allow_trust_op.asset"][0];
    const asset = assetData.native
      ? Asset.native()
      : new Asset(assetData.code, assetData["asset.issuer"][0]["account.id"]);

    return {
      ...this.baseData,
      ...{
        trustor: this.data["allow_trust_op.trustor"][0]["account.id"],
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
    const assetData = this.data["change_trust_op.asset"][0];
    const asset = new Asset(assetData.code, assetData["asset.issuer"][0]["account.id"]);

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
        destination: this.data["op.destination"][0]["account.id"]
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
    const assetBuyingData = this.data["manage_offer_op.asset_buying"][0];
    const assetSellingData = this.data["manage_offer_op.asset_selling"][0];

    const assetBuying = assetBuyingData.native
      ? Asset.native()
      : new Asset(assetBuyingData.code, assetBuyingData["asset.issuer"][0]["account.id"]);
    const assetSelling = assetSellingData.native
      ? Asset.native()
      : new Asset(assetSellingData.code, assetSellingData["asset.issuer"][0]["account.id"]);

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
    const destinationAssetData = this.data["path_payment_op.asset_destination"][0];
    const sourceAssetData = this.data["path_payment_op.asset_source"][0];

    const destinationAsset = destinationAssetData.native
      ? Asset.native()
      : new Asset(destinationAssetData.code, destinationAssetData["asset.issuer"][0]["account.id"]);
    const sourceAsset = sourceAssetData.native
      ? Asset.native()
      : new Asset(sourceAssetData.code, sourceAssetData["asset.issuer"][0]["account.id"]);

    return {
      ...this.baseData,
      ...{
        sendMax: this.data.send_max,
        destinationAmount: this.data.amount,
        destinationAccount: this.data["op.destination"][0]["account.id"],
        destinationAsset,
        sourceAccount: this.data["op.source"][0]["account.id"],
        sourceAsset,
        path: this.data["path_payment_op.assets_path"].map((assetData: IAssetData) => {
          return assetData.native
            ? Asset.native()
            : new Asset(assetData.code, assetData["asset.issuer"][0]["account.id"]);
        })
      }
    };
  }
}
