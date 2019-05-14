import BigNumber from "bignumber.js";
import { VarArray } from "js-xdr";
import { xdr } from "stellar-base";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { AccountFlags, AccountThresholds, Signer } from "../../model";
import { AccountFlagsFactory, AccountThresholdsFactory, SignerFactory } from "../../model/factories";
import { Base64Transformer, BigNumberTransformer } from "../../util/orm";
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

  @Column({ name: "homedomain", transformer: Base64Transformer })
  homeDomain: string;

  @Column({
    type: "text",
    transformer: {
      from: (value: string) => AccountThresholdsFactory.fromValue(value),
      // we don't actually need `to` transform,
      // because we never write to the db, so it's just a stab
      to: (value: AccountThresholds) => "AQAAAA=="
    }
  })
  thresholds: AccountThresholds;

  @Column({
    type: "integer",
    transformer: {
      from: (value: number) => AccountFlagsFactory.fromValue(value),
      // we don't actually need `to` transform,
      // because we never write to the db, so it's just a stab
      to: (value: AccountFlags) => 0
    }
  })
  flags: AccountFlags;

  @Column({ name: "lastmodified" })
  lastModified: number;

  @Column({
    name: "buyingliabilities",
    type: "bigint",
    transformer: BigNumberTransformer
  })
  buyingLiabilities: BigNumber;

  @Column({
    name: "sellingliabilities",
    type: "bigint",
    transformer: BigNumberTransformer
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
      // we don't actually need `to` transform,
      // because we never write to the db, so it's just a stab
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
