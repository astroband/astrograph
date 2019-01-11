export interface ILedgerHeader {
  ledgerSeq: number;
  previousLedgerHash: string;
  txSetResultHash: string;
  ledgerVersion: number;
  baseFee: number;
  baseReserve: number;
  maxTxSetSize: number;
  closeTime: Date;
}

export class LedgerHeader implements ILedgerHeader {
  public ledgerSeq: number;
  public previousLedgerHash: string;
  public txSetResultHash: string;
  public ledgerVersion: number;
  public baseFee: number;
  public baseReserve: number;
  public maxTxSetSize: number;
  public closeTime: Date;

  constructor(data: ILedgerHeader) {
    this.ledgerSeq = data.ledgerSeq;
    this.previousLedgerHash = data.previousLedgerHash;
    this.txSetResultHash = data.txSetResultHash;
    this.ledgerVersion = data.ledgerVersion;
    this.baseFee = data.baseFee;
    this.baseReserve = data.baseReserve;
    this.maxTxSetSize = data.maxTxSetSize;
    this.closeTime = data.closeTime;
  }
}
