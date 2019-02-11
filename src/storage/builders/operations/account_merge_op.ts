import { AccountBuilder, SpecificOperationBuilder } from "../";
import { publicKeyFromBuffer } from "../../../util/xdr/account";
import { NQuads } from "../../nquads";

export class AccountMergeOpBuilder extends SpecificOperationBuilder {
  public build(): NQuads {
    super.build();

    this.pushBuilder(new AccountBuilder(publicKeyFromBuffer(this.xdr.destination().value())), "op.destination");

    return this.nquads;
  }

  protected get resultCode() {
    if (!this.trXDR) {
      return;
    }

    return this.trXDR.accountMergeResult().switch().value;
  }
}
