import { publicKeyFromBuffer } from "../../../util/xdr/account";
import { NQuad, NQuads } from "../../nquads";
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
    const result = this.trXDR.accountMergeResult();
    this.pushValue("account_merge_result_code", result.switch().value);

    const resultNQuad = NQuad.blank(`${this.current.value}_result`);

    this.nquads.push(
      new NQuad(resultNQuad, "source_account_balance", NQuad.value(result.sourceAccountBalance().toString()));
    );

    this.nquads.push(new NQuad(this.current, "result", resultNQuad));
  }
}
