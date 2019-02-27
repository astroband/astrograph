import stellar from "stellar-base";
import { makeKey } from "../../util/crypto";
import { IBlank, NQuad, NQuads } from "../nquads";
import { AccountBuilder, AssetBuilder, Builder } from "./";

export class PathPaymentResultBuilder extends Builder {
  public static key(args: any[]): string {
    return makeKey("path_payment_result", ...args);
  }

  public static keyNQuad(args: any[]): IBlank {
    return NQuad.blank(PathPaymentResultBuilder.key(args));
  }

  public current: IBlank;

  constructor(baseKey: any[], private xdr: any) {
    super();
    this.current = PathPaymentResultBuilder.keyNQuad(baseKey);
  }

  public build(): NQuads {
    const code = this.xdr.switch().value;
    const resultCodes = stellar.xdr.PathPaymentResultCode;
    this.pushValue("path_payment_op.result_code", code);

    if (this.xdr.switch() !== resultCodes.pathPaymentSuccess()) {
      if (this.xdr.switch() === resultCodes.pathPaymentNoIssuer()) {
        this.pushBuilder(AssetBuilder.fromXDR(this.xdr.noIssuer()), "path_payment_op.no_issuer");
      }
      return this.nquads;
    }

    this.pushLast();
    this.pushOffers();

    return this.nquads;
  }

  private pushLast() {
    const key = PathPaymentResultBuilder.key(["last", this.current.value]);
    const lastNQuad = NQuad.blank(key);
    const last = this.xdr.success().last();

    this.nquads.push(new NQuad(this.current, "last", lastNQuad));

    const lastAssetBuilder = AssetBuilder.fromXDR(last.asset());

    this.pushBuilder(lastAssetBuilder);

    this.nquads.push(new NQuad(lastNQuad, "key", NQuad.value(key)));
    this.nquads.push(new NQuad(lastNQuad, "destination", NQuad.blank(AccountBuilder.keyFromXDR(last.destination()))));
    this.nquads.push(new NQuad(lastNQuad, "last.asset", lastAssetBuilder.current));
  }

  private pushOffers() {
    this.xdr
      .success()
      .offers()
      .forEach((offer: any, index: number) => {
        const key = PathPaymentResultBuilder.key([`result_offer_${index}`, this.current.value]);
        const offerNQuad = NQuad.blank(key);

        this.nquads.push(new NQuad(offerNQuad, "seller", NQuad.blank(AccountBuilder.keyFromXDR(offer.sellerId()))));

        const assetSoldBuilder = AssetBuilder.fromXDR(offer.assetSold());
        const assetBoughtBuilder = AssetBuilder.fromXDR(offer.assetBought());

        this.pushBuilder(assetSoldBuilder);
        this.pushBuilder(assetBoughtBuilder);

        this.nquads.push(new NQuad(offerNQuad, "key", NQuad.value(key)));
        this.nquads.push(new NQuad(offerNQuad, "asset_sold", assetSoldBuilder.current));
        this.nquads.push(new NQuad(offerNQuad, "asset_bought", assetBoughtBuilder.current));

        this.nquads.push(new NQuad(offerNQuad, "offer_id", NQuad.value(offer.offerId().toString())));
        this.nquads.push(new NQuad(offerNQuad, "amount_sold", NQuad.value(offer.amountSold().toString())));
        this.nquads.push(new NQuad(offerNQuad, "amount_bought", NQuad.value(offer.amountBought().toString())));

        this.nquads.push(new NQuad(this.current, `${this.entityPrefix}.offers`, offerNQuad));
      });
  }

  private get entityPrefix() {
    return "path_payment_op";
  }
}
