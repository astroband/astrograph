import stellar from "stellar-base";

export class LedgerHeader {
  public xdr: string;
  public ledgerSeq: number;
  public previousLedgerHash: string;
  public txSetResultHash: string;
  public ledgerVersion: number;
  public baseFee: number;
  public baseReserve: number;
  public maxTxSetSize: number;

  constructor(data: { data: string }) {
    this.xdr = data.data;
    const header = stellar.xdr.LedgerHeader.fromXDR(Buffer.from(this.xdr, "base64"));
    this.ledgerSeq = header.ledgerSeq();
    this.previousLedgerHash = Buffer.from(header.previousLedgerHash()).toString("hex");
    this.txSetResultHash = Buffer.from(header.txSetResultHash()).toString("hex");
    this.ledgerVersion = header.ledgerVersion();
    this.baseFee = header.baseFee();
    this.baseReserve = header.baseReserve();
    this.maxTxSetSize = header.maxTxSetSize();
  }
}
