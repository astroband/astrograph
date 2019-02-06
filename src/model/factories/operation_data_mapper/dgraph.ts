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
      kind: data.kind,
      account: data["account.source"][0]["account.id"],
      index: parseInt(data.index, 10),
      dateTime: new Date(data.ledger[0].close_time),
      transactionId: data.transaction[0].id
    };
  }

  public call(): Operation {
    // I don't know, why I need casting here :(
    switch (this.data.kind as OperationKinds) {
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
    const assetData = this.data.asset[0];
    const asset = assetData.native ? Asset.native() : new Asset(assetData.code, assetData.issuer[0]["account.id"]);

    return {
      ...this.baseData,
      ...{
        destination: this.data["account.destination"][0]["account.id"],
        source: this.data["account.source"][0]["account.id"],
        amount: this.data.amount,
        asset
      }
    };
  }

  private mapAccountMerge(): IAccountMergeOperation {
    return {
      ...this.baseData,
      ...{
        destination: this.data["account.destination"][0]["account.id"]
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
        inflationDestination: this.data["account.inflation_dest"][0]["account.id"],
        signer: {
          account: this.data.signer[0].account[0]["account.id"],
          weight: parseInt(this.data.signer[0].weight, 10)
        }
      }
    };
  }

  private mapAllowTrust(): IAllowTrustOperation {
    return {
      ...this.baseData,
      ...{
        trustor: this.data.trustor[0]["account.id"],
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

  private mapChangeTrust(): IChangeTrustOperation {
    const asset = new Asset(this.data.asset[0].code, this.data.asset[0].issuer[0]["account.id"]);

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
        destination: this.data["account.destination"][0]["account.id"]
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
    const assetBuyingData = this.data["asset.buying"][0];
    const assetSellingData = this.data["asset.selling"][0];

    const assetBuying = assetBuyingData.native
      ? Asset.native()
      : new Asset(assetBuyingData.code, assetBuyingData.issuer[0]["account.id"]);
    const assetSelling = assetSellingData.native
      ? Asset.native()
      : new Asset(assetSellingData.code, assetSellingData.issuer[0]["account.id"]);

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
    const destinationAssetData = this.data["asset.destination"][0];
    const sourceAssetData = this.data["asset.source"][0];

    const destinationAsset = destinationAssetData.native
      ? Asset.native()
      : new Asset(destinationAssetData.code, destinationAssetData.issuer[0]["account.id"]);
    const sourceAsset = sourceAssetData.native
      ? Asset.native()
      : new Asset(sourceAssetData.code, sourceAssetData.issuer[0]["account.id"]);

    return {
      ...this.baseData,
      ...{
        sendMax: this.data.send_max,
        destinationAmount: this.data.dest_amount,
        destinationAccount: this.data["account.destination"][0]["account.id"],
        destinationAsset,
        sourceAccount: this.data["account.source"][0]["account.id"],
        sourceAsset,
        path: this.data["assets.path"].map((assetData: IAssetData) => {
          return assetData.native ? Asset.native() : new Asset(assetData.code, assetData.issuer[0]["account.id"]);
        })
      }
    };
  }
}
