import { Asset } from "stellar-sdk";
import { makeKey } from "../../util/crypto";
import { AccountID } from "../../util/types";
import { NQuad, NQuads, Subj } from "../nquads";
import { AccountBuilder, AssetBuilder } from "./";
import { Builder } from "./builder";

interface ITradeCounterpart {
  sellerId: AccountID;
  buyerId: AccountID;
  asset: Asset;
  amount: number;
  offerId: number;
}

export class TradeBuilder extends Builder {
  public static key(offerId: number, sellerId: string, buyerId: string) {
    return makeKey("trade", offerId.toString(), sellerId, buyerId);
  }

  public readonly current: Subj;

  private sellerId: AccountID;
  private buyerId: AccountID;
  private asset: Asset;
  private amount: number;
  private offerId: number;

  constructor(tradeData: ITradeCounterpart) {
    super();
    this.sellerId = tradeData.sellerId;
    this.buyerId = tradeData.buyerId;
    this.asset = tradeData.asset;
    this.offerId = tradeData.offerId;
    this.amount = tradeData.amount;

    this.current = NQuad.blank(TradeBuilder.key(this.offerId, this.sellerId, this.buyerId));
  }

  public build(): NQuads {
    this.pushKey();

    this.pushValues({ trade: "", amount: this.amount, offer_id: this.offerId });

    this.pushBuilder(new AccountBuilder(this.sellerId), "op.source");
    this.pushBuilder(new AccountBuilder(this.buyerId), "op.destination");
    this.pushBuilder(new AssetBuilder(this.asset), "trade.asset", "operations");

    return this.nquads;
  }
}
