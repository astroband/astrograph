import { publicKeyFromBuffer } from "../util/xdr/account";
import { Asset } from "./";

export interface IPaymentOperation {
  source: string | null;
  destination: string;
  asset: Asset;
  amount: string;
}

export class PaymentOperation implements IPaymentOperation {
  public static buildFromXDR(xdr: any) {
    const op = xdr.body().paymentOp();
    const amount = op.amount().toString();
    const destination = publicKeyFromBuffer(op.destination().value());
    const asset = Asset.buildFromXDR(op.asset());

    let source = null;

    const account = xdr.sourceAccount();

    if (account) {
      source = publicKeyFromBuffer(account.value());
    }

    return new PaymentOperation(destination, asset, amount, source);
  }

  constructor(public destination: string, public asset: Asset, public amount: string, public source: string | null) {}
}
