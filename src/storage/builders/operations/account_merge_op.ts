import { AccountBuilder, SpecificOperationBuilder } from "../";
import { publicKeyFromBuffer } from "../../../util/xdr/account";
import { NQuad, NQuads } from "../../nquads";

export class AccountMergeOpBuilder extends SpecificOperationBuilder {
  public build(): NQuads {
    super.build();

    const destinationBuilder = new AccountBuilder(publicKeyFromBuffer(this.body.destination().value()));

    this.nquads.push(new NQuad(this.sourceAccountBuilder.current, "account.merged_into", destinationBuilder.current));
    this.pushBuilder(destinationBuilder, "op.destination");

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
