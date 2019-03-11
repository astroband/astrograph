import BigNumber from "bignumber.js";
import stellar from "stellar-base";
import { Asset } from "stellar-sdk";

import { IHorizonOperationData } from "../../datasource/types";
import { DgraphOperationsData } from "../../storage/types";
import { Operation as HorizonOperation } from "../horizon_operation";
import { Operation } from "../operation";
import { DataMapper as DgraphDataMapper } from "./operation_data_mapper/dgraph";
import { DataMapper as HorizonDataMapper } from "./operation_data_mapper/horizon";

export class OperationFactory {
  public static fromDgraph(node: DgraphOperationsData): Operation {
    return DgraphDataMapper.call(node);
  }

  public static fromHorizon(node: IHorizonOperationData): HorizonOperation {
    return HorizonDataMapper.call(node);
  }

  public static fromXDR(xdr: any): any {
    const t = stellar.xdr.OperationType;

    switch (xdr.body().switch()) {
      // case t.createAccount():
      //   return new CreateAccountOpBuilder(...args);
      // case t.payment():
      //   return new PaymentOpBuilder(...args);
      // case t.pathPayment():
      //   return new PathPaymentOpBuilder(...args);
      case t.manageOffer():
        const body = xdr.manageOfferOp();
        return {
          amount: body.amount().toString(),
          offerId: body.offerId().toString(),
          price: new BigNumber(body.price().n()).div(body.price().d()).toString(),
          priceComponents: { n: body.price().n(), d: body.price().d() },
          assetBuying: Asset.fromOperation(body.buying()),
          assetSelling: Asset.fromOperation(body.selling())
        }
      // case t.setOption():
      //   return new SetOptionsOpBuilder(...args);
      // case t.changeTrust():
      //   return new ChangeTrustOpBuilder(...args);
      // case t.accountMerge():
      //   return new AccountMergeOpBuilder(this.current, this.sourceAccount, this.xdr.body(), this.resultXDR);
      // case t.manageDatum():
      //   return new ManageDataOpBuilder(...args);
      // case t.allowTrust():
      //   return new AllowTrustOpBuilder(...args);
      // case t.bumpSequence():
      //   return new BumpSequenceOpBuilder(...args);
    }
  }
}
