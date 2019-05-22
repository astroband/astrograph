import BigNumber from "bignumber.js";
import { Column, Entity, PrimaryColumn } from "typeorm";
import { AccountID, AssetID } from "../../model";
import { AssetTransformer, BigNumberTransformer } from "../../util/orm";

@Entity("offers")
/* tslint:disable */
export class Offer {
  @PrimaryColumn({ name: "offerid" })
  id: string;

  @Column({ name: "sellerid" })
  seller: AccountID;

  @Column({ name: "sellingasset", type: "text", transformer: AssetTransformer  })
  selling: AssetID;

  @Column({ name: "buyingasset", type: "text", transformer: AssetTransformer  })
  buying: AssetID;

  @Column({ type: "bigint", transformer: BigNumberTransformer })
  amount: BigNumber;

  @Column({ name: "pricen" })
  priceN: number;

  @Column({ name: "priced" })
  priceD: number;

  @Column({ type: "double precision", transformer: BigNumberTransformer })
  price: BigNumber;

  flags: number;

  @Column({ name: "lastmodified" })
  lastModified: number;

  public get paging_token() {
    return this.id;
  }
}
