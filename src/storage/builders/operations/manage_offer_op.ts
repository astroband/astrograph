import { Asset } from "stellar-sdk";
import { SpecificOperationBuilder, TradeBuilder } from "../";
import { publicKeyFromBuffer } from "../../../util/xdr/account";
import { IBlank, NQuad, NQuads } from "../../nquads";

export class ManageOfferOpBuilder extends SpecificOperationBuilder {
  constructor(
    public readonly current: IBlank,
    protected xdr: any,
    public readonly source: string,
    protected resultXDR: any
  ) {
    super(current, xdr, resultXDR);
  }

  public build(): NQuads {
    const result = this.trXDR.manageOfferResult().success();

    if (!result) {
      return this.nquads;
    }

    result.offersClaimed().forEach((atom: any) => {
      const sellerId = publicKeyFromBuffer(atom.sellerId().value());
      const offerId = atom.offerId().toInt();

      const tradeBuilder1 = new TradeBuilder({
        sellerId,
        buyerId: this.source,
        asset: Asset.fromOperation(atom.assetSold()),
        amount: atom.amountSold().toInt(),
        offerId
      });

      const tradeBuilder2 = new TradeBuilder({
        sellerId: this.source,
        buyerId: sellerId,
        asset: Asset.fromOperation(atom.assetBought()),
        amount: atom.amountBought().toInt(),
        offerId
      });

      this.nquads.push(...tradeBuilder1.build());
      this.nquads.push(...tradeBuilder2.build());
      this.nquads.push(new NQuad(tradeBuilder1.current, "trade.counterpart", tradeBuilder2.current));
      this.nquads.push(new NQuad(tradeBuilder2.current, "trade.counterpart", tradeBuilder1.current));
    });

    return this.nquads;
  }

  protected get resultCode() {
    if (!this.trXDR) {
      return;
    }

    return this.trXDR.manageOfferResult().switch().value;
  }
}
