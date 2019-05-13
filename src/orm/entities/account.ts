import BigNumber from "bignumber.js";
import { VarArray } from "js-xdr";
import { xdr } from "stellar-base";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { AccountFlags, AccountThresholds, Signer } from "../../model";
import { AccountFlagsFactory, AccountThresholdsFactory, SignerFactory } from "../../model/factories";
import { AccountData } from "./account_data";

@Entity("accounts")
/* tslint:disable */
export class Account {
  @PrimaryColumn({ name: "accountid" })
  id: string;

  @Column("bigint")
  balance: string;

  @Column({ name: "seqnum", type: "bigint" })
  sequenceNumber: string;

  @Column({ name: "numsubentries" })
  numSubentries: number;

  @Column({ name: "inflationdest" })
  inflationDestination: string;

  @Column({
    name: "homedomain",
    transformer: {
      from: (value: string) => Buffer.from(value, "base64").toString(),
      to: (value: string) => Buffer.from(value).toString("base64")
    }
  })
  homeDomain: string;

  @Column({
    type: "text",
    transformer: {
      from: (value: string) => AccountThresholdsFactory.fromValue(value),
      to: (value: AccountThresholds) => "AQAAAA=="
    }
  })
  thresholds: AccountThresholds;

  @Column({
    type: "integer",
    transformer: {
      from: (value: number) => AccountFlagsFactory.fromValue(value),
      to: (value: AccountFlags) => 0
    }
  })
  flags: AccountFlags;

  @Column({ name: "lastmodified" })
  lastModified: number;

  @Column({
    name: "buyingliabilities",
    type: "bigint",
    transformer: {
      from: (value: string) => new BigNumber(value),
      to: (value: BigNumber) => value.toString()
    }
  })
  buyingLiabilities: BigNumber;

  @Column({
    name: "sellingliabilities",
    type: "bigint",
    transformer: {
      from: (value: string) => new BigNumber(value),
      to: (value: BigNumber) => value.toString()
    }
  })
  sellingLiabilities: BigNumber;

  @Column({
    type: "text",
    transformer: {
      from: (value: string | null) => {
        if (!value) {
          return null;
        }
        const signersArray = new VarArray(xdr.Signer).fromXDR(value, "base64");
        return signersArray.map((signerXDR: any) => SignerFactory.fromXDR(signerXDR));
      },
      to: (value: Signer[]) => null
    }
  })
  signers: Signer[] | null;

  @OneToMany(type => AccountData, accountData => accountData.account)
  data: AccountData[];

  public get paging_token() {
    return this.id;
  }
}
