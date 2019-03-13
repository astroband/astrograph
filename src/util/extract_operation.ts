import BigNumber from "bignumber.js";
import { Asset } from "stellar-base";
import { ChangesExtractor, ChangeType, EntryType } from "../changes_extractor";
import { AccountID, Operation, OperationKinds, TransactionWithXDR } from "../model";
import { publicKeyFromXDR } from "./xdr/account";
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

  if (opObject.kind === OperationKinds.PathPayment) {
    opObject.amountSent = getSentAmount(tx, index, opObject.destinationAccount);
  }

  delete opObject.source;

  return {
    opSource,
    txSource: tx.sourceAccount,
    index,
    transactionId: tx.id,
    ...opObject
  };
}

function getSentAmount(tx: TransactionWithXDR, index: number, destination: AccountID) {
  const changes = ChangesExtractor.call(tx)[index + 1].filter(c => {
    return (
      c.type === ChangeType.Updated &&
      (c.entry === EntryType.Trustline || c.entry === EntryType.Account) &&
      publicKeyFromXDR(c.data.value()) === destination
    );
  });

  const lastChange = changes[changes.length - 1];
  const data = lastChange.entry === EntryType.Account ? lastChange.data.account() : lastChange.data.trustLine();

  return new BigNumber(data.balance().toString()).minus(lastChange.prevState.balance).toString();
}
