import BigNumber from "bignumber.js";
import { Asset } from "stellar-sdk";
import { AssetBuilder, SpecificOperationBuilder } from "../";
import { NQuads } from "../../nquads";

export class ManageOfferOpBuilder extends SpecificOperationBuilder {
  public build(): NQuads {
    const selling = Asset.fromOperation(this.xdr.selling());
    const buying = Asset.fromOperation(this.xdr.buying());
    const price = {
      n: this.xdr.price().n(),
      d: this.xdr.price().d()
    };

    this.pushValue("price_n", price.n);
    this.pushValue("price_d", price.d);
    this.pushValue("price", new BigNumber(price.n).div(price.d).toString());

    this.pushValue("amount", this.xdr.amount().toString());
    this.pushValue("offer_id", this.xdr.offerId().toString());
    this.pushBuilder(new AssetBuilder(selling), "manage_offer_op.asset_selling", "operations");
    this.pushBuilder(new AssetBuilder(buying), "manage_offer_op.asset_buying", "operations");

    return this.nquads;
  }

  protected get resultCode() {
    if (!this.trXDR) {
      return;
    }

    return this.trXDR.manageOfferResult().switch().value;
  }
}
