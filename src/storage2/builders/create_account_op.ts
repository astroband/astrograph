import { AccountBuilder } from "./account";
import { Builder } from "./builder";
import { IBlank, NQuads } from "../nquads";
import { publicKeyFromBuffer } from "../../util/xdr/account";

export class CreateAccountOpBuilder extends Builder {
  private xdr: any;

  constructor(public readonly current: IBlank, xdr: any) {
    super();

    this.xdr = xdr.body().createAccountOp();
  }

  public build(): NQuads {
    const startingBalance = this.xdr.startingBalance().toString();
    const destination = publicKeyFromBuffer(this.xdr.destination().value());

    this.pushValue("starting_balance", startingBalance);
    this.pushBuilder(new AccountBuilder(destination), "account.destination", "operations");

    return this.nquads;
  }
}
