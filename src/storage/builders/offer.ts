import { BigNumber } from "bignumber.js";
import { IOffer } from "../../model";
import { makeKey } from "../../util/crypto";
import { IBlank, NQuad } from "../nquads";
import { AccountBuilder, AssetBuilder, Builder } from "./index";

export class OfferBuilder extends Builder {
  public static key(offerId: string) {
    return makeKey("offer", offerId);
  }

  public readonly current: IBlank;

  constructor(private readonly offer: IOffer) {
    super();

    this.current = NQuad.blank(OfferBuilder.key(offer.id));
  }

  public build() {
    this.pushKey();
    this.pushValues({
      "offer.id": this.offer.id,
      selling_amount: this.offer.amount,
      buying_amount: new BigNumber(this.offer.amount).times(this.offer.price).toString(),
      price: this.offer.price,
      last_modified_seq: this.offer.lastModified
    });

    this.pushLink("offer.seller", AccountBuilder.key(this.offer.sellerID));
    this.pushBuilder(new AssetBuilder(this.offer.selling), "offer.asset_selling", undefined, {
      price: this.offer.price
    });
    this.pushBuilder(new AssetBuilder(this.offer.buying), "offer.asset_buying", undefined, { price: this.offer.price });

    return this.nquads;
  }
}
