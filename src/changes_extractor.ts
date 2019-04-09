import { xdr as XDR } from "stellar-base";
import { Asset } from "stellar-sdk";
import { Transaction, TransactionWithXDR } from "./model";
import { AccountValuesFactory } from "./model/factories/account_values_factory";

export enum ChangeType {
  Created = "created",
  Updated = "updated",
  Removed = "removed",
  State = "state"
}

export enum EntryType {
  Account = "account",
  Trustline = "trustline",
  Data = "datum",
  Offer = "offer"
}

const changeType = XDR.LedgerEntryChangeType;
const ledgerEntryType = XDR.LedgerEntryType;

export interface IChange {
  type: string;
  entry: string;
  data: any;
  seq: number;
  tx: Transaction;
  accountChanges?: string[];
  prevState?: any;
}

export class ChangesExtractor {
  public static call(tx: TransactionWithXDR) {
    return new ChangesExtractor(tx).call();
  }

  constructor(private tx: TransactionWithXDR) {}

  public call(): IChange[][] {
    const rawChanges = this.getRawChanges();

    return rawChanges.map(group => {
      return group
        .map((change, i) => {
          const type = this.determineChangeType(change);
          const data = type === ChangeType.Removed ? change.removed() : change[type]().data();
          const entry = this.determineEntryType(data);

          const result: IChange = { type, entry, data, seq: this.tx.ledgerSeq, tx: this.tx };

          if (!group[i - 1] || group[i - 1].switch() !== changeType.ledgerEntryState()) {
            return result;
          }

          if (entry === EntryType.Account && type !== ChangeType.Removed) {
            result.accountChanges = this.getAccountChanges(data.account(), group[i - 1].state().data());
          }

          result.prevState = this.buildPrevState(group[i - 1].state(), entry);

          return result;
        })
        .filter(el => el !== undefined) as IChange[];
    });
  }

  private determineChangeType(changeXDR: any): ChangeType {
    switch (changeXDR.switch()) {
      case changeType.ledgerEntryCreated():
        return ChangeType.Created;
      case changeType.ledgerEntryUpdated():
        return ChangeType.Updated;
      case changeType.ledgerEntryRemoved():
        return ChangeType.Removed;
      case changeType.ledgerEntryState():
        return ChangeType.State;
      default:
        throw new Error(`Unknown change type ${changeXDR.switch().name}`);
    }
  }

  private determineEntryType(changeDataXDR: any): EntryType {
    switch (changeDataXDR.switch()) {
      case ledgerEntryType.account():
        return EntryType.Account;
      case ledgerEntryType.trustline():
        return EntryType.Trustline;
      case ledgerEntryType.datum():
        return EntryType.Data;
      case ledgerEntryType.offer():
        return EntryType.Offer;
      default:
        throw new Error(`Unknown change entry type ${changeDataXDR.switch().name}`);
    }
  }

  private getRawChanges(): any[][] {
    const txMetaXDR = this.tx.metaXDR;
    const rawChanges = [this.tx.feeMetaXDR.changes()];

    switch (txMetaXDR.switch()) {
      case 0:
        for (const op of txMetaXDR.operations()) {
          rawChanges.push(op.changes());
        }
        break;
      case 1:
        rawChanges.push(txMetaXDR.v1().txChanges());
        for (const op of txMetaXDR.v1().operations()) {
          rawChanges.push(op.changes());
        }
        break;
    }

    return rawChanges;
  }

  private getAccountChanges(accountData: any, stateXDR: any) {
    const accountState = stateXDR.account();

    if (!accountState) {
      return [];
    }

    const accountValues1 = AccountValuesFactory.fromXDR(accountData);
    const accountValues2 = AccountValuesFactory.fromXDR(accountState);

    return accountValues1.diffAttrs(accountValues2);
  }

  private buildPrevState(ledgerEntryState: any, entry: EntryType) {
    const result: { ledgerSeq: number; balance?: string; selling?: Asset; buying?: Asset } = {
      ledgerSeq: ledgerEntryState.lastModifiedLedgerSeq()
    };

    const prevStateData = ledgerEntryState.data();

    switch (entry) {
      case EntryType.Account:
        result.balance = prevStateData
          .account()
          .balance()
          .toString();
        break;
      case EntryType.Trustline:
        result.balance = prevStateData
          .trustLine()
          .balance()
          .toString();
        break;
      case EntryType.Offer:
        result.selling = Asset.fromOperation(prevStateData.offer().selling());
        result.buying = Asset.fromOperation(prevStateData.offer().buying());
        break;
    }

    return result;
  }
}
