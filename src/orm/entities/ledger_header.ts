import { xdr } from "stellar-base";
import { Column, Entity, PrimaryColumn } from "typeorm";
import { DateTransformer } from "../../util/orm";

interface ILedgerHeaderData {
  txSetResultHash: string;
  ledgerVersion: number;
  baseFee: number;
  baseReserve: number;
  maxTxSetSize: number;
}

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

  @Column({
    type: "text",
    transformer: {
      from: (data: string) => {
        const dataXDR = xdr.LedgerHeader.fromXDR(data, "base64");
        return {
          ledgerVersion: dataXDR.ledgerVersion(),
          baseFee: dataXDR.baseFee(),
          baseReserve: dataXDR.baseReserve(),
          maxTxSetSize: dataXDR.maxTxSetSize(),
          txSetResultHash: Buffer.from(dataXDR.txSetResultHash()).toString("hex")
        }
      },
      to: (data: ILedgerHeaderData) => {
        return "";
      }
    }
  })
  data: ILedgerHeaderData;

  public get txSetResultHash() {
    return this.data.txSetResultHash;
  }

  public get ledgerVersion() {
    return this.data.ledgerVersion;
  }

  public get baseFee() {
    return this.data.baseFee;
  }

  public get baseReserve() {
    return this.data.baseReserve;
  }

  public get maxTxSetSize() {
    return this.data.maxTxSetSize;
  }
}
