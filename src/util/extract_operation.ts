import BigNumber from "bignumber.js";
import { Asset } from "stellar-base";
import { ChangesExtractor, ChangeType, EntryType } from "../changes_extractor";
import { AccountID, Operation, OperationKinds, Transaction, TransactionWithXDR } from "../model";
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

  if (opObject.kind === OperationKinds.PathPayment && tx.success) {
    opObject.amountSent = getSentAmount(tx, index, opSource);
  }

  delete opObject.source;

  return {
    sourceAccount: opSource,
    tx: new Transaction(tx),
    index,
    ...opObject
  };
}

function getSentAmount(tx: TransactionWithXDR, index: number, source: AccountID) {
  // we should skip fee changes and transaction changes, that's why +2. Not sure, why it's working, need more research
  const changes = ChangesExtractor.call(tx)[index + 2].filter(c => {
    return (
      c.type === ChangeType.Updated &&
      (c.entry === EntryType.Trustline || c.entry === EntryType.Account) &&
      publicKeyFromXDR(c.data.value()) === source
    );
  });

  const lastChange = changes[changes.length - 1];

  const data = lastChange.entry === EntryType.Account ? lastChange.data.account() : lastChange.data.trustLine();

  return new BigNumber(lastChange.prevState.balance).minus(data.balance().toString()).toString();
}
