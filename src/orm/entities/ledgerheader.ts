import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("ledgerheaders")
/* tslint:disable */
export class LedgerHeader {
  @PrimaryColumn({ name: "ledgerhash" })
  ledgerHash: string;

  @Column({ name: "prevhash" })
  prevHash: string;

  @Column({ name: "bucketlisthash" })
  bucketListHash: string;

  @Column({ name: "ledgerseq" })
  seq: number;

  @Column({ name: "closetime" })
  closeTime: Date;

  @Column()
  data: string;
}
