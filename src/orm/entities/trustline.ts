import BigNumber from "bignumber.js";
import { xdr } from "stellar-base";
import { Column, Entity, PrimaryColumn } from "typeorm";
import { AccountID, AssetID, IBalance } from "../../model";
import { AssetFactory } from "../../model/factories";
import { BigNumberTransformer } from "../../util/orm";

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

  @Column({
    name: "extension",
    type: "text",
    nullable: true,
    transformer: {
      from: (value: string | null) => {
        if (!value) {
          return null;
        }

        const extension = xdr.AccountEntryExt.fromXDR(value, "base64")

        return new BigNumber(extension.v1().liabilities().buying());
      },
      // we don't actually need `to` transform,
      // because we never write to the db, so it's just a stab
      to: (value: BigNumber) => null
    }
  })
  buyingLiabilities: BigNumber | null;

  @Column({
    name: "extension",
    type: "text",
    nullable: true,
    transformer: {
      from: (value: string | null) => {
        if (!value) {
          return null;
        }

        const extension = xdr.AccountEntryExt.fromXDR(value, 'base64');

        return new BigNumber(extension.v1().liabilities().selling());
      },
      // we don't actually need `to` transform,
      // because we never write to the db, so it's just a stab
      to: (value: BigNumber) => null
    }
  })
  sellingLiabilities: BigNumber | null;

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
    return (this.flags & xdr.TrustLineFlags.authorizedFlag().value) > 0;
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
