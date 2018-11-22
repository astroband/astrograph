import { publicKeyFromBuffer } from "../../../util/xdr/account";
import { NQuads } from "../../nquads";
import { AccountBuilder } from "../account";
import { SpecificOperationBuilder } from "../specific_operation";

export class AccountMergeOpBuilder extends SpecificOperationBuilder {
  public build(): NQuads {
    super.build();

    this.pushBuilder(
      new AccountBuilder(publicKeyFromBuffer(this.xdr.destination().value())),
      "account.destination",
      "operations"
    );

    return this.nquads;
  }

  protected pushResult() {
    this.pushValue(
      "source_account_balance",
      this.trXDR.accountMergeResult().sourceAccountBalance().toString()
    );
  }
}
