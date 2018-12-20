import stellar from "stellar-base";
import { ILedgerHeader, LedgerHeader } from "../ledger_header";

export class LedgerHeaderFactory {
  public static fromXDR(base64: string): LedgerHeader {
    const header = stellar.xdr.LedgerHeader.fromXDR(Buffer.from(base64, "base64"));

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
}
