import BigNumber from "bignumber.js";
import { Asset } from "stellar-sdk";
import { IBlank, NQuads } from "../../nquads";
import { AssetBuilder } from "../asset";
import { Builder } from "../builder";

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
    // const priceNquad = NQuad.blank(`${this.current.value}_price`);

    this.pushValue("price_n", price.n);
    this.pushValue("price_d", price.d);
    this.pushValue("price", new BigNumber(price.n).div(price.d).toString());

    this.pushValue("amount", this.xdr.amount().toString());
    this.pushValue("offer_id", this.xdr.offerId().toString());
    this.pushBuilder(new AssetBuilder(selling), "asset.selling", "operations");
    this.pushBuilder(new AssetBuilder(buying), "asset.buying", "operations");

    return this.nquads;
  }
}
