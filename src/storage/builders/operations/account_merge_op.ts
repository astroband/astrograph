import { AccountBuilder, SpecificOperationBuilder } from "../";
import { NQuad, NQuads } from "../../nquads";

export class AccountMergeOpBuilder extends SpecificOperationBuilder {
  public build(): NQuads {
    super.build();

    const destinationAccountKey = AccountBuilder.keyFromXDR(this.body.destination().value());

    this.nquads.push(new NQuad(this.sourceAccountBuilder.current, "account.merged_into", NQuad.blank(destinationAccountKey)));
    this.pushLink("op.destination", destinationAccountKey);

    return this.nquads;
  }

  protected get resultCode(): number | undefined {
    if (!this.trXDR) {
      return;
    }

    return this.trXDR.accountMergeResult().switch().value;
  }

  protected get body(): any {
    return this.bodyXDR;
  }
}
