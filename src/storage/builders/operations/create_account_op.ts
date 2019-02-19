import { Memoize } from "typescript-memoize";
import { AccountBuilder, SpecificOperationBuilder } from "../";
import { publicKeyFromBuffer } from "../../../util/xdr/account";
import { NQuads } from "../../nquads";

export class CreateAccountOpBuilder extends SpecificOperationBuilder {
  public build(): NQuads {
    super.build();

    const startingBalance = this.body.startingBalance().toString();
    const destinationId = publicKeyFromBuffer(this.body.destination().value());
    const destinationBuilder = new AccountBuilder(destinationId);

    this.pushValue("starting_balance", startingBalance);
    this.pushBuilder(destinationBuilder, "account.destination");

    return this.nquads;
  }

  protected get resultCode(): number | undefined {
    if (!this.trXDR) {
      return;
    }

    return this.trXDR.createAccountResult().switch().value;
  }

  @Memoize()
  protected get body(): any {
    return this.bodyXDR.createAccountOp();
  }
}
