import BigNumber from "bignumber.js";
import stellar from "stellar-base";
import { publicKeyFromBuffer } from "./xdr/account";

export function refineOperationXDR(xdr: any) {
  const t = stellar.xdr.OperationType;
  const source = xdr.sourceAccount() ? publicKeyFromBuffer(xdr.sourceAccount().value()) : null;
  let obj: any;

  switch (xdr.body().switch()) {
    case t.createAccount():
      obj = refineCreateAccountOpXDR(xdr.body().createAccountOp());
      break;
    case t.pathPayment():
      obj = refinePathPaymentOpXDR(xdr.body().pathPaymentOp());
      break;
    case t.setOption():
      obj = refineSetOptionOpXDR(xdr.body().setOptionsOp());
      break;
    case t.changeTrust():
      obj = refineChangeTrustOpXDR(xdr.body().changeTrustOp());
      break;
    case t.accountMerge():
      obj = refineAccountMergeOpXDR(xdr.body());
      break;
    case t.manageDatum():
      obj = refineManageDataOpXDR(xdr.body().manageDataOp());
      break;
    case t.allowTrust():
      obj = refineAllowTrustOpXDR(xdr.body().allowTrustOp());
      break;
    case t.bumpSequence():
      obj = refineBumpSequenceOpXDR(xdr.body().bumpSequenceOp());
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

function refineCreateAccountOpXDR(body: any) {
  return {
    startingBalance: body.startingBalance().toString(),
    destination: publicKeyFromBuffer(body.destination().value())
  };
}

function refinePathPaymentOpXDR(body: any) {
  return {};
}
function refineSetOptionOpXDR(body: any) {
  return {};
}

function refineChangeTrustOpXDR(body: any) {
  return {
    limit: body.limit().toString(),
    asset: stellar.Asset.fromOperation(body.line())
  };
}

function refineAccountMergeOpXDR(body: any) {
  return {
    destination: publicKeyFromBuffer(body.destination().value())
  };
}

function refineManageDataOpXDR(body: any) {
  return {
    name: body.dataName().toString(),
    value: body.dataValue() ? body.dataValue().toString("base64") : undefined
  };
}

function refineAllowTrustOpXDR(body: any) {
  return {
    trustor: publicKeyFromBuffer(body.trustor().value()),
    authorize: body.authorize(),
    asset: body.asset().value().toString().replace(/\0/g, "")
  };
}

function refineBumpSequenceOpXDR(body: any) {
  return {
    bumpTo: body.bumpTo().toString()
  };
}
