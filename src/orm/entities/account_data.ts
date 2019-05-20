import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Base64Transformer } from "../../util/orm";
import { Account } from "./account";

@Entity("accountdata")
/* tslint:disable */
export class AccountData {
  @PrimaryColumn({ name: "accountid" })
  id: string;

  @PrimaryColumn({ name: "dataname", transformer: Base64Transformer })
  name: string;

  @Column({ name: "datavalue" })
  value: string;

  @Column({ name: "lastmodified" })
  lastModified: number;

  @ManyToOne(type => Account, account => account.data)
  @JoinColumn({ name: "accountid" })
  account: Account;
}
