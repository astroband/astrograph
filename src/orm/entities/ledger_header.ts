import { xdr } from "stellar-base";
import { AfterLoad, Column, Entity, PrimaryColumn } from "typeorm";
import { DateTransformer } from "../../util/orm";

@Entity("ledgerheaders")
/* tslint:disable */
export class LedgerHeader {
  @PrimaryColumn({ name: "ledgerhash" })
  ledgerHash: string;

  @Column({ name: "ledgerseq" })
  ledgerSeq: number;

  @Column({ name: "prevhash" })
  previousLedgerHash: string;

  @Column({ name: "closetime", transformer: DateTransformer })
  closeTime: Date;

  @Column()
  data: string

  txSetResultHash: string;
  ledgerVersion: number;
  baseFee: number;
  baseReserve: number;
  maxTxSetSize: number;

  @AfterLoad()
  parseData() {
    const dataXDR = xdr.LedgerHeader.fromXDR(this.data, "base64");

    this.ledgerVersion = dataXDR.ledgerVersion();
    this.baseFee = dataXDR.baseFee();
    this.baseReserve = dataXDR.baseReserve();
    this.maxTxSetSize = dataXDR.maxTxSetSize();
    this.txSetResultHash = Buffer.from(dataXDR.txSetResultHash()).toString("hex");
  }
}
