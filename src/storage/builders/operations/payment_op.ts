import { Asset } from "stellar-sdk";

import { publicKeyFromBuffer } from "../../../util/xdr/account";
import { NQuads } from "../../nquads";

import { AccountBuilder, AssetBuilder, SpecificOperationBuilder } from "../";

export class PaymentOpBuilder extends SpecificOperationBuilder {
  public build(): NQuads {
    super.build();
    const asset = Asset.fromOperation(this.xdr.asset());
    const amount = this.xdr.amount().toString();
    const destination = publicKeyFromBuffer(this.xdr.destination().value());

    this.pushValue("amount", amount);
    this.pushBuilder(new AccountBuilder(destination), "account.destination", "operations");
    this.pushBuilder(new AssetBuilder(asset), "asset", "operations");

    return this.nquads;
  }

  protected pushResult() {
    const code = this.trXDR.paymentResult().switch().value;
    this.pushValue("payment_result_code", code);
  }
}
