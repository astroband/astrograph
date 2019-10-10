import BigNumber from "bignumber.js";
import { Asset, xdr as XDR } from "stellar-base";
import { publicKeyFromBuffer } from "./xdr/account";
import { signerKeyFromXDR } from "./xdr/signer";

export function refineOperationXDR(xdr: any) {
  const t = XDR.OperationType;
  const source = xdr.sourceAccount() ? publicKeyFromBuffer(xdr.sourceAccount().value()) : null;
  let obj: any;
  const body = xdr.body();

  switch (xdr.body().switch()) {
    case t.createAccount():
      obj = refineCreateAccountOpXDR(body.createAccountOp());
      break;
    case t.pathPayment():
      obj = refinePathPaymentOpXDR(body.pathPaymentOp());
      break;
    case t.setOption():
      obj = refineSetOptionsOpXDR(body.setOptionsOp());
      break;
    case t.changeTrust():
      obj = refineChangeTrustOpXDR(body.changeTrustOp());
      break;
    case t.accountMerge():
      obj = refineAccountMergeOpXDR(body);
      break;
    case t.manageDatum():
      obj = refineManageDataOpXDR(body.manageDataOp());
      break;
    case t.allowTrust():
      obj = refineAllowTrustOpXDR(body.allowTrustOp());
      break;
    case t.bumpSequence():
      obj = refineBumpSequenceOpXDR(body.bumpSequenceOp());
      break;
    case t.manageSellOffer():
      obj = refineManageSellOfferOpXDR(body.manageSellOfferOp());
      break;
    case t.manageBuyOffer():
      obj = refineManageBuyOfferOpXDR(body.manageBuyOfferOp());
      break;
    case t.createPassiveSellOffer():
      obj = refineCreatePassiveSellOfferOpXDR(body.createPassiveSellOfferOp());
      break;
    case t.payment():
      obj = refinePaymentOpXDR(body.paymentOp());
      break;
    default:
      throw new Error(`Unknown operation XDR type "${xdr.body().switch().value}"`);
  }

  return {
    source,
    type: body.switch().name,
    ...obj
  };
}

function refineManageSellOfferOpXDR(body: any) {
  return {
    amount: body.amount().toString(),
    offerId: body.offerId().toString(),
    price: new BigNumber(body.price().n()).div(body.price().d()).toString(),
    priceComponents: { n: body.price().n(), d: body.price().d() },
    assetBuying: Asset.fromOperation(body.buying()),
    assetSelling: Asset.fromOperation(body.selling())
  };
}

function refineManageBuyOfferOpXDR(body: any) {
  return {
    amount: body.buyAmount().toString(),
    offerId: body.offerId().toString(),
    price: new BigNumber(body.price().n()).div(body.price().d()).toString(),
    priceComponents: { n: body.price().n(), d: body.price().d() },
    assetBuying: Asset.fromOperation(body.buying()),
    assetSelling: Asset.fromOperation(body.selling())
  };
}

function refineCreatePassiveSellOfferOpXDR(body: any) {
  return {
    amount: body.amount().toString(),
    price: new BigNumber(body.price().n()).div(body.price().d()).toString(),
    priceComponents: { n: body.price().n(), d: body.price().d() },
    assetBuying: Asset.fromOperation(body.buying()),
    assetSelling: Asset.fromOperation(body.selling())
  };
}

function refinePaymentOpXDR(body: any) {
  return {
    destination: publicKeyFromBuffer(body.destination().value()),
    amount: body.amount().toString(),
    asset: Asset.fromOperation(body.asset())
  };
}

function refineCreateAccountOpXDR(body: any) {
  return {
    startingBalance: body.startingBalance().toString(),
    destination: publicKeyFromBuffer(body.destination().value())
  };
}

function refinePathPaymentOpXDR(body: any) {
  return {
    sendMax: body.sendMax().toString(),
    amountReceived: body.destAmount().toString(),
    destinationAccount: publicKeyFromBuffer(body.destination().value()),
    destinationAsset: Asset.fromOperation(body.destAsset()),
    sourceAsset: Asset.fromOperation(body.sendAsset())
  };
}

function refineSetOptionsOpXDR(body: any) {
  const options: any = {
    masterWeight: body.masterWeight(),
    homeDomain: body.homeDomain() ? body.homeDomain().toString() : undefined,
    clearFlags: body.clearFlags(),
    setFlags: body.setFlags(),
    thresholds: {
      high: body.highThreshold(),
      medium: body.medThreshold(),
      low: body.lowThreshold()
    },
    inflationDestination: body.inflationDest() ? publicKeyFromBuffer(body.inflationDest().value()) : undefined
  };

  if (body.signer()) {
    options.signer = {
      account: signerKeyFromXDR(body.signer().key()),
      weight: body.signer().weight()
    };
  }

  return options;
}

function refineChangeTrustOpXDR(body: any) {
  return {
    limit: body.limit().toString(),
    asset: Asset.fromOperation(body.line())
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
    asset: body
      .asset()
      .value()
      .toString()
      .replace(/\0/g, "")
  };
}

function refineBumpSequenceOpXDR(body: any) {
  return {
    bumpTo: body.bumpTo().toString()
  };
}
