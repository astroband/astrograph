import { IOfferBase, Offer } from "../../model";
import { OfferFactory } from "../../model/factories/offer_factory";
import { makeKey } from "../../util/crypto";
import { IBlank, NQuad, NQuads } from "../nquads";
import { AccountBuilder, AssetBuilder, Builder } from "./index";

export class OfferBuilder extends Builder {
  public static key(offerId: number) {
    return makeKey("offer", offerId);
  }

  public readonly current: IBlank;

  constructor(private readonly data: any, private readonly ledgerSeq: number) {
    super();

    const offerId = this.data instanceof Offer ? this.data.id : this.data.offerId();

    this.current = NQuad.blank(OfferBuilder.key(offerId));
  }

  public build(): NQuads {
    const offer: IOfferBase = this.data instanceof Offer ? this.data : OfferFactory.fromXDR(this.data);

    this.pushKey();

    this.buildFromModel(offer);

    return this.nquads;
  }

  private buildFromModel(offer: IOfferBase) {
    this.pushValues({
      "offer.id": offer.id,
      amount: offer.amount,
      price_n: offer.priceN,
      price_d: offer.priceD,
      last_modified_seq: this.ledgerSeq
    });

    this.pushBuilder(new AccountBuilder(offer.sellerID), "offer.seller");
    this.pushBuilder(new AssetBuilder(offer.selling), "offer.asset_selling");
    this.pushBuilder(new AssetBuilder(offer.buying), "offer.asset_buying");

    return this.nquads;
  }
}
