import BigNumber from "bignumber.js";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { AccountID, AssetID } from "../../model";
import { AssetFactory } from "../../model/factories";
import { BigNumberTransformer } from "../../util/orm";
import { Account } from "./";

@Entity("trustlines")
/* tslint:disable */
export class TrustLine {
  @PrimaryColumn({ name: "accountid" })
  @ManyToOne(type => Account, account => account.trustLines)
  @JoinColumn({ name: "accountid" })
  account: Account;

  @PrimaryColumn()
  issuer: AccountID;

  @PrimaryColumn({ name: "assetcode" })
  assetCode: string;

  @Column({ name: "assettype" })
  assetType: number;

  @Column({ name: "tlimit", type: "bigint", transformer: BigNumberTransformer })
  limit: BigNumber;

  @Column({ type: "bigint", transformer: BigNumberTransformer })
  balance: BigNumber;

  @Column()
  flags: number;

  @Column({ name: "lastmodified" })
  lastModified: number;

  @Column({ type: "bigint", name: "buyingliabilities", transformer: BigNumberTransformer })
  buyingLiabilities: BigNumber;

  @Column({ type: "bigint", name: "sellingliabilities", transformer: BigNumberTransformer })
  sellingLiabilities: BigNumber;

  public get asset(): AssetID {
    return AssetFactory.fromTrustline(this.assetType, this.assetCode, this.issuer).toString();
  }
}
