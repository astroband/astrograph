import BigNumber from "bignumber.js";
import { Asset } from "stellar-sdk";
import { AssetBuilder, SpecificOperationBuilder } from "../";
import { NQuads } from "../../nquads";

export class ManageOfferOpBuilder extends SpecificOperationBuilder {
  public build(): NQuads {
    super.build();

    const selling = Asset.fromOperation(this.body.selling());
    const buying = Asset.fromOperation(this.body.buying());
    const price = {
      n: this.body.price().n(),
      d: this.body.price().d()
    };

    this.pushValue("price_n", price.n);
    this.pushValue("price_d", price.d);
    this.pushValue("price", new BigNumber(price.n).div(price.d).toString());

    this.pushValue("amount", this.body.amount().toString());
    this.pushValue("offer_id", this.body.offerId().toString());
    this.pushBuilder(new AssetBuilder(selling), "manage_offer_op.asset_selling", "operations");
    this.pushBuilder(new AssetBuilder(buying), "manage_offer_op.asset_buying", "operations");

    return this.nquads;
  }

  protected get resultCode(): number | undefined {
    if (!this.trXDR) {
      return;
    }

    return this.trXDR.manageOfferResult().switch().value;
  }

  protected get body(): any {
    return this.bodyXDR.manageOfferOp();
  }
}
