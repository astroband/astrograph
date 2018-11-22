import { publicKeyFromBuffer } from "../../../util/xdr/account";
import { NQuads } from "../../nquads";
import { AccountBuilder } from "../account";
import { SpecificOperationBuilder } from "../specific_operation";

export class CreateAccountOpBuilder extends SpecificOperationBuilder {
  public build(): NQuads {
    super.build();

    const startingBalance = this.xdr.startingBalance().toString();
    const destination = publicKeyFromBuffer(this.xdr.destination().value());

    this.pushValue("starting_balance", startingBalance);
    this.pushBuilder(new AccountBuilder(destination), "account.destination", "operations");

    return this.nquads;
  }

  protected pushResult() {
    const code = this.trXDR.createAccountResult().switch().value;
    this.pushValue("create_account_result_code", code);
  }
}
