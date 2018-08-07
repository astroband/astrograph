import stellar from "stellar-base";

export default class Transaction {
  public ID: string;
  public ledgerSeq: number;
  public index: number;
  public body: string;
  public result: string;
  public meta: string;

  constructor(data: { data: string }) {
    this.ID = data.txid;
    this.ledgerSeq = data.ledgerseq;
    this.index = data.txIndex;
    this.body = data.txBody;
    this.result = data.txResult;
    this.meta = data.txMeta;
  }
}
