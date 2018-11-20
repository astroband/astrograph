import { AccountBuilder } from "./account";
import { AssetBuilder } from "./asset_builder";
import { Builder } from "./builder";
import { IBlank, NQuads } from "../nquads";
import { publicKeyFromBuffer } from "../../util/xdr/account";
import { Asset } from "stellar-sdk";

export class PaymentOpBuilder extends Builder {
  constructor(public readonly current: IBlank, private xdr: any) { super(); }

  public build(): NQuads {
    const asset = Asset.fromOperation(this.xdr.asset());
    const amount = this.xdr.amount().toString();
    const destination = publicKeyFromBuffer(this.xdr.destination().value());

    this.pushValue("amount", amount);
    this.pushBuilder(new AccountBuilder(destination), "account.destination", "operations");
    this.pushBuilder(new AssetBuilder(asset), "asset", "operations");

    return this.nquads;
  }
}
