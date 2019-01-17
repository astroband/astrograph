import { publicKeyFromBuffer } from "../../../util/xdr/account";
import { NQuad, NQuads } from "../../nquads";
import { AccountBuilder, SpecificOperationBuilder } from "../";

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
    const result = this.trXDR.accountMergeResult();
    const resultCode = result.switch().value;
    this.pushValue("account_merge_result_code", resultCode);

    // if not success
    if (resultCode !== 0) {
      return;
    }

    const resultNQuad = NQuad.blank(`${this.current.value}_result`);

    this.nquads.push(
      new NQuad(resultNQuad, "source_account_balance", NQuad.value(result.sourceAccountBalance().toString()))
    );

    this.nquads.push(new NQuad(this.current, "result", resultNQuad));
  }
}
