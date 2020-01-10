import stellar from "stellar-base";
import { ILedgerHeaderData } from "../../storage/types";
import { ILedgerHeader, LedgerHeader } from "../ledger_header";

export interface ILedgerHeaderTableRow {
  ledgerhash: string;
  prevhash: string;
  bucketlisthash: string;
  ledgerseq: string;
  closetime: string;
  data: string;
}

export class LedgerHeaderFactory {
  public static fromXDR(base64: string): LedgerHeader {
    const header = stellar.xdr.LedgerHeader.fromXDR(base64, "base64");

    const data: ILedgerHeader = {
      ledgerSeq: header.ledgerSeq(),
      previousLedgerHash: Buffer.from(header.previousLedgerHash()).toString("hex"),
      txSetResultHash: Buffer.from(header.txSetResultHash()).toString("hex"),
      ledgerVersion: header.ledgerVersion(),
      baseFee: header.baseFee(),
      baseReserve: header.baseReserve(),
      maxTxSetSize: header.maxTxSetSize(),
      closeTime: new Date(header.scpValue().closeTime() * 1000)
    };

    return new LedgerHeader(data);
  }

  public static fromDb(data: ILedgerHeaderTableRow): LedgerHeader {
    return LedgerHeaderFactory.fromXDR(data.data);
  }

  public static fromStorage(data: ILedgerHeaderData): LedgerHeader {
    return new LedgerHeader({
      ledgerSeq: data.seq,
      previousLedgerHash: data.prev_hash,
      txSetResultHash: data.tx_set_result_hash,
      ledgerVersion: data.version,
      baseFee: data.base_fee,
      baseReserve: data.base_reserve,
      maxTxSetSize: data.max_tx_set_size,
      closeTime: new Date(data.close_time)
    });
  }
}
