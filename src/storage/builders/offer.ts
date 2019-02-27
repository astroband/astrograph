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
      amount: this.offer.amount,
      price_n: this.offer.priceN,
      price_d: this.offer.priceD,
      last_modified_seq: this.offer.lastModified
    });

    this.pushLink("offer.seller", AccountBuilder.key(this.offer.sellerID));
    this.pushBuilder(new AssetBuilder(this.offer.selling), "offer.asset_selling");
    this.pushBuilder(new AssetBuilder(this.offer.buying), "offer.asset_buying");

    return this.nquads;
  }
}
