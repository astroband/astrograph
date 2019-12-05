import BigNumber from "bignumber.js";
import { Asset } from "stellar-base";
import { ChangesExtractor, ChangeType, EntryType } from "../changes_extractor";
import { AccountID, Operation, OperationType, Transaction, TransactionWithXDR } from "../model";
import { buildOperationId } from "./horizon";
import { publicKeyFromXDR } from "./xdr/account";
import { refineOperationXDR } from "./xdr_refiner";

export default function extractOperation(
  ledgerInfo: { ledgerSeq: number; closeTime: Date },
  tx: TransactionWithXDR,
  index: number
): Operation {
  const opXDR = tx.operationsXDR[index];

  if (!opXDR) {
    throw new Error(`No operation with index ${index} in this transaction`);
  }

  const opObject = refineOperationXDR(opXDR);
  opObject.dateTime = ledgerInfo.closeTime;
  opObject.id = buildOperationId(ledgerInfo.ledgerSeq, tx.index, index + 1);

  const opSource = opObject.source || tx.sourceAccount;

  if (opObject.type === OperationType.AllowTrust) {
    opObject.asset = new Asset(opObject.asset, opSource);
  }

  if (opObject.type === OperationType.PathPayment && tx.success) {
    opObject.amountSent = getSentAmount(tx, index, opSource);
  }

  if (opObject.type === OperationType.PathPaymentStrictSend && tx.success) {
    opObject.amountReceived = getReceivedAmount(tx, index, opObject.destinationAccount);
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

function getReceivedAmount(tx: TransactionWithXDR, index: number, destination: AccountID) {
  // we should skip fee changes and transaction changes, that's why +2. Not sure, why it's working, need more research
  const changes = ChangesExtractor.call(tx)[index + 2].filter(c => {
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
