import { Asset } from "stellar-sdk";
import { Memoize } from "typescript-memoize";

import { publicKeyFromBuffer } from "../../../util/xdr/account";
import { NQuads } from "../../nquads";

import { AccountBuilder, AssetBuilder, SpecificOperationBuilder } from "../";

export class PaymentOpBuilder extends SpecificOperationBuilder {
  public build(): NQuads {
    super.build();
    const asset = Asset.fromOperation(this.body.asset());
    const amount = this.body.amount().toString();
    const destination = publicKeyFromBuffer(this.body.destination().value());

    this.pushValue("amount", amount);
    this.pushLink("op.destination", AccountBuilder.key(destination));
    this.pushBuilder(new AssetBuilder(asset), `payment_op.asset`, "operations");

    return this.nquads;
  }

  protected get resultCode(): number | undefined {
    if (!this.trXDR) {
      return;
    }

    return this.trXDR.paymentResult().switch().value;
  }

  @Memoize()
  protected get body(): any {
    return this.bodyXDR.paymentOp();
  }
}
