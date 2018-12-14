import { ITransaction, Transaction } from "./transaction";

export interface ITransactionWithXDR extends ITransaction {
  body: string;
  bodyXDR: any;
  result: string;
  resultXDR: any;
  meta: string;
  metaXDR: any;
  feeMeta: string;
  feeMetaXDR: any;
}

// This is used for internal purposes only for now. Probably must be moved to repos layer.
export class TransactionWithXDR extends Transaction {
  public body: string;
  public bodyXDR: any;
  public result: string;
  public resultXDR: any;
  public meta: string;
  public metaXDR: any;
  public feeMeta: string;
  public feeMetaXDR: any;

  constructor(data: ITransactionWithXDR) {
    super(data);

    this.body = data.body;
    this.bodyXDR = data.bodyXDR;
    this.result = data.result;
    this.resultXDR = data.resultXDR;
    this.meta = data.meta;
    this.metaXDR = data.metaXDR;
    this.feeMeta = data.feeMeta;
    this.feeMetaXDR = data.feeMetaXDR;
  }
}

// public operationsXDR(): any {
//   return this.envelopeXDR.tx().operations();
// }
//
// public operationResultsXDR(): any {
//   return this.resultXDR
//     .result()
//     .result()
//     .results();
// }
