import BigNumber from "bignumber.js";
import { xdr as XDR } from "stellar-base";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { AccountID, AssetID, IBalance } from "../../model";
import { AssetFactory } from "../../model/factories";
import { BigNumberTransformer } from "../../util/orm";
import { Account } from "./";

@Entity("trustlines")
/* tslint:disable */
export class TrustLine implements IBalance {
  @PrimaryColumn({ name: "accountid" })
  account: AccountID;

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

  public static parsePagingToken(token: string) {
    const [accountId, , balance] =
      Buffer
        .from(token, "base64")
        .toString()
        .split("_");

    return { balance, account: accountId }
  }

  public get asset(): AssetID {
    return AssetFactory.fromTrustline(this.assetType, this.assetCode, this.issuer).toString();
  }

  public get authorized(): boolean {
    return (this.flags & XDR.TrustLineFlags.authorizedFlag().value) > 0;
  }

  public get spendableBalance(): BigNumber {
    return this.balance.minus(this.sellingLiabilities || 0);
  }

  public get receivableBalance(): BigNumber {
    return this.limit.minus(this.buyingLiabilities || 0).minus(this.balance);
  }

  public get paging_token() {
    return Buffer.from(`${this.account}_${this.asset.toString()}_${this.balance}`).toString("base64");
  }
}
