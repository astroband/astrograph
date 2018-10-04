import stellar from "stellar-base";

export class Transaction {
  public id: string;
  public ledgerSeq: number;
  public index: number;
  public body: string;
  public result: string;
  public meta: string;
  public feeMeta: string;

  public envelopeXDR: any;

  constructor(data: {
    txid: string;
    ledgerseq: number;
    txindex: number;
    txbody: string;
    txresult: string;
    txmeta: string;
    txfeemeta: string;
  }) {
    this.id = data.txid;
    this.ledgerSeq = data.ledgerseq;
    this.index = data.txindex;
    this.body = data.txbody;
    this.result = data.txresult;
    this.meta = data.txmeta;
    this.feeMeta = data.txfeemeta;

    this.envelopeXDR = stellar.xdr.TransactionEnvelope.fromXDR(Buffer.from(this.body, "base64"));
  }

  public metaFromXDR() {
    return stellar.xdr.TransactionMeta.fromXDR(Buffer.from(this.meta, "base64"));
  }

  public feeMetaFromXDR() {
    return stellar.xdr.OperationMeta.fromXDR(Buffer.from(this.feeMeta, "base64"));
  }
}
