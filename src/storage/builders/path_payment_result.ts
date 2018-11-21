import { makeKey } from "../../util/crypto";
import { IBlank, NQuad, NQuads } from "../nquads";
import { AccountBuilder } from "./account";
import { AssetBuilder } from "./asset_builder";
import { Builder } from "./builder";

export class PathPaymentResultBuilder extends Builder {
  public static key(id: string) {
    return makeKey("path_payment_result", id);
  }

  public current: IBlank;
  private success: any;

  constructor(operationKey: string, private xdr: any) {
    super();
    this.current = NQuad.blank(PathPaymentResultBuilder.key(operationKey));
    this.success = xdr.success();
  }

  public build(): NQuads {
    const code = this.xdr.switch().value;
    this.pushValue("path_payment_result_code", code);

    if (this.success === undefined) {
      // FIXME handle failure
      return [];
    }

    this.pushLast();
    this.pushOffers();

    return this.nquads;
  }

  private pushLast() {
    const lastNQuad = NQuad.blank(`${this.current.value}_last`);
    const last = this.success.last();

    this.nquads.push(new NQuad(this.current, "last", lastNQuad));

    const destinationAccountBuilder = AccountBuilder.fromXDR(last.destination());
    const lastAssetBuilder = AssetBuilder.fromXDR(last.asset());

    this.pushBuilder(destinationAccountBuilder);
    this.pushBuilder(lastAssetBuilder);

    this.nquads.push(new NQuad(lastNQuad, "account.destination", destinationAccountBuilder.current));
    this.nquads.push(new NQuad(lastNQuad, "asset", lastAssetBuilder.current));
  }

  private pushOffers() {
    this.success.offers().forEach((offer: any, index: number) => {
      const offerNQuad = NQuad.blank(`${this.current.value}_result_offer_${index}`);

      const sellerBuilder = AccountBuilder.fromXDR(offer.sellerId());
      this.pushBuilder(sellerBuilder);
      this.nquads.push(new NQuad(offerNQuad, "seller", sellerBuilder.current));

      const assetSoldBuilder = AssetBuilder.fromXDR(offer.assetSold());
      const assetBoughtBuilder = AssetBuilder.fromXDR(offer.assetBought());

      this.pushBuilder(assetSoldBuilder);
      this.pushBuilder(assetBoughtBuilder);

      this.nquads.push(new NQuad(offerNQuad, "asset.sold", assetSoldBuilder.current));
      this.nquads.push(new NQuad(offerNQuad, "asset.bought", assetBoughtBuilder.current));

      this.nquads.push(new NQuad(offerNQuad, "offer_id", NQuad.value(offer.offerId().toString())));
      this.nquads.push(new NQuad(offerNQuad, "amount_sold", NQuad.value(offer.amountSold().toString())));
      this.nquads.push(new NQuad(offerNQuad, "amount_bought", NQuad.value(offer.amountBought().toString())));

      this.nquads.push(new NQuad(this.current, "offers", offerNQuad));
    });
  }
}
