import { Asset } from "stellar-base";
import { makeKey } from "../../util/crypto";
import { publicKeyFromBuffer } from "../../util/xdr/account";
import { IBlank, NQuad, NQuads } from "../nquads";
import { AccountBuilder, AssetBuilder, Builder } from "./index";

export class OfferBuilder extends Builder {
  public static key(offerId: number) {
    return makeKey("offer", offerId);
  }

  public readonly current: IBlank;

  constructor(private xdr: any, private ledgerSeq: number) {
    super();

    this.current = NQuad.blank(OfferBuilder.key(xdr.offerId()));
  }

  public build(): NQuads {
    const sellerId = publicKeyFromBuffer(this.xdr.sellerId().value());
    const buyingAsset = Asset.fromOperation(this.xdr.buying());
    const sellingAsset = Asset.fromOperation(this.xdr.selling());

    this.pushKey();
    this.pushValues({
      "offer.id": this.xdr.offerId().toInt(),
      amount: this.xdr.amount().toInt(),
      price_n: this.xdr.price().n(),
      price_d: this.xdr.price().d(),
      last_modified_seq: this.ledgerSeq
    });

    this.pushBuilder(new AccountBuilder(sellerId), "offer.seller");
    this.pushBuilder(new AssetBuilder(sellingAsset), "offer.asset_selling");
    this.pushBuilder(new AssetBuilder(buyingAsset), "offer.asset_buying");

    return this.nquads;
  }
}
