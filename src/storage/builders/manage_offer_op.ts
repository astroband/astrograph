import { Asset } from "stellar-sdk";
import { IBlank, NQuad, NQuads } from "../nquads";
import { AssetBuilder } from "./asset_builder";
import { Builder } from "./builder";

export class ManageOfferOpBuilder extends Builder {
  constructor(public readonly current: IBlank, private xdr: any) {
    super();
  }

  public build(): NQuads {
    const selling = Asset.fromOperation(this.xdr.selling());
    const buying = Asset.fromOperation(this.xdr.buying());
    const price = {
      n: this.xdr.price().n(),
      d: this.xdr.price().d()
    };
    const priceNquad = NQuad.blank(`${this.current.value}_price`);

    this.nquads.push(new NQuad(this.current, "price", priceNquad));
    this.nquads.push(new NQuad(priceNquad, "n", price.n));
    this.nquads.push(new NQuad(priceNquad, "p", price.d));

    this.pushValue("amount", this.xdr.amount().toString());
    this.pushValue("offer_id", this.xdr.offerId().toString());
    this.pushBuilder(new AssetBuilder(selling), "asset.selling", "operations");
    this.pushBuilder(new AssetBuilder(buying), "asset.buying", "operations");

    return this.nquads;
  }
}
