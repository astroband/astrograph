import { Operation, TransactionWithXDR } from "../model";
import { refineOperationXDR } from "./xdr_refiner";

export default function extractOperation(tx: TransactionWithXDR, index: number): Operation {
  const opXDR = tx.operationsXDR[index];

  if (!opXDR) {
    throw new Error(`No operation with index ${index} in this transaction`);
  }

  const opObject = refineOperationXDR(opXDR);

  return {
    opSource: opObject.source || tx.sourceAccount,
    txSource: tx.sourceAccount,
    index,
    transactionId: tx.id,
    ...opObject
  };
}
