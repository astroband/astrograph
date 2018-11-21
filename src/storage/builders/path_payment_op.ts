import { Asset } from "stellar-sdk";
import { publicKeyFromBuffer } from "../../util/xdr/account";
import { IBlank, NQuads } from "../nquads";
import { AccountBuilder } from "./account";
import { AssetBuilder } from "./asset";
import { Builder } from "./builder";

export class PathPaymentOpBuilder extends Builder {
  constructor(public readonly current: IBlank, private xdr: any) {
    super();
  }

  public build(): NQuads {
    const destAsset = Asset.fromOperation(this.xdr.destAsset());
    const srcAsset = Asset.fromOperation(this.xdr.sendAsset());
    const destination = publicKeyFromBuffer(this.xdr.destination().value());

    this.pushValue("send_max", this.xdr.sendMax().toString());
    this.pushValue("dest_amount", this.xdr.destAmount().toString());
    this.pushBuilder(new AccountBuilder(destination), "account.destination", "operations");
    this.pushBuilder(new AssetBuilder(destAsset), "asset.destination", "operations");
    this.pushBuilder(new AssetBuilder(srcAsset), "asset.source", "operations");

    (this.xdr.path() as any[]).forEach(xdr => {
      const asset = Asset.fromOperation(xdr);
      this.pushBuilder(new AssetBuilder(asset), "assets.path", "operations");
    });

    return this.nquads;
  }
}
