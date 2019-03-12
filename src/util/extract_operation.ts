import { Asset } from "stellar-base";
import { Operation, OperationKinds, TransactionWithXDR } from "../model";
import { refineOperationXDR } from "./xdr_refiner";

export default function extractOperation(tx: TransactionWithXDR, index: number): Operation {
  const opXDR = tx.operationsXDR[index];

  if (!opXDR) {
    throw new Error(`No operation with index ${index} in this transaction`);
  }

  const opObject = refineOperationXDR(opXDR);
  const opSource = opObject.source || tx.sourceAccount;

  if (opObject.kind === OperationKinds.AllowTrust) {
    opObject.asset = new Asset(opObject.asset, opSource);
  }

  return {
    opSource,
    txSource: tx.sourceAccount,
    index,
    transactionId: tx.id,
    ...opObject
  };
}
