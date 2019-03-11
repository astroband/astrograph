import BigNumber from "bignumber.js";
import stellar from "stellar-base";
import { publicKeyFromBuffer } from "./xdr/account";

export function refineOperationXDR(xdr: any) {
  const t = stellar.xdr.OperationType;
  const source = xdr.sourceAccount() ? publicKeyFromBuffer(xdr.sourceAccount().value()) : null;
  let obj: any;

  switch (xdr.body().switch()) {
    case t.createAccount():
      obj = {};
      break;
    case t.pathPayment():
      obj = {};
      break;
    case t.setOption():
      obj = {};
      break;
    case t.changeTrust():
      obj = {};
      break;
    case t.accountMerge():
      obj = {};
      break;
    case t.manageDatum():
      obj = {};
      break;
    case t.allowTrust():
      obj = {};
      break;
    case t.bumpSequence():
      obj = {};
      break;
    case t.manageOffer():
      obj = refineManageOfferOpXDR(xdr.body().manageOfferOp());
      break;
    case t.payment():
      obj = refinePaymentOpXDR(xdr.body().paymentOp());
      break;
    default:
      throw new Error("Unknown operation XDR");
  }

  return {
    source,
    kind: xdr.body().switch().name,
    ...obj
  };
}

function refineManageOfferOpXDR(body: any) {
  return {
    amount: body.amount().toString(),
    offerId: body.offerId().toString(),
    price: new BigNumber(body.price().n()).div(body.price().d()).toString(),
    priceComponents: { n: body.price().n(), d: body.price().d() },
    assetBuying: stellar.Asset.fromOperation(body.buying()),
    assetSelling: stellar.Asset.fromOperation(body.selling())
  };
}

function refinePaymentOpXDR(body: any) {
  return {
    destination: publicKeyFromBuffer(body.destination().value()),
    amount: body.amount().toString(),
    asset: stellar.Asset.fromOperation(body.asset())
  };
}
