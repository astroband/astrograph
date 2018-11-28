import stellar from "stellar-base";
import { Transaction } from "./model";
import { diffAccountsXDR, publicKeyFromXDR } from "./util/xdr";

type ChangeType = "created" | "updated" | "removed" | "state";
type EntryType = "account" | "trustline" | "datum";

const changeType = stellar.xdr.LedgerEntryChangeType;
const ledgerEntryType = stellar.xdr.LedgerEntryType;

interface IChange {
  type: string;
  entry: string;
  data: any;
  seq: number;
  tx: Transaction;
  accountChanges?: string[];
}

export class ChangesExtractor {
  public static call(tx: Transaction) {
    return new ChangesExtractor(tx).call();
  }

  constructor(private tx: Transaction) {}

  public call() {
    const rawChanges = this.getRawChanges();

    return rawChanges.map(group => {
      return group.map((change, i) => {
        try {
          const type = this.determineChangeType(change);
          const data = changeType === "removed" ? change.removed() : change[type]().data();
          const entry = this.determineEntryType(data);

          const result: IChange = { type, entry, data, seq: this.tx.ledgerSeq, tx: this.tx };

          if (entry === "account") {
            result.accountChanges = this.getAccountChanges(data.account(), group.slice(0, i));
          }

          return result;
        } catch (e) {
          return;
        }
      }).filter(el => el !== undefined);
    })
  }

  private determineChangeType(changeXDR: any): ChangeType {
    switch (changeXDR.switch()) {
      case changeType.ledgerEntryCreated():
        return "created";
      case changeType.ledgerEntryUpdated():
        return "updated";
      case changeType.ledgerEntryRemoved():
        return "removed";
      case changeType.ledgerEntryState():
        return "state";
      default:
        throw new Error(`Unknown change type ${changeXDR.switch().name}`);
    }
  }

  private determineEntryType(changeDataXDR: any): EntryType {
    switch (changeDataXDR.switch()) {
      case ledgerEntryType.account():
        return "account";
      case ledgerEntryType.trustline():
        return "trustline";
      case ledgerEntryType.datum():
        return "datum";
      default:
        throw new Error(`Unknown change entry type ${changeDataXDR.switch().name}`);
    }
  }

  private getRawChanges(): any[][] {
    const txMetaXDR = this.tx.metaFromXDR();
    const rawChanges = [];

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

    rawChanges.push(this.tx.feeMetaFromXDR().changes());

    return rawChanges;
  }

  private getAccountChanges(accountData: any, prevChanges: any[]) {
    const updateAccount = this.findUpdateOrState(prevChanges, publicKeyFromXDR(accountData));

    if (!updateAccount) {
      return [];
    }

    return diffAccountsXDR(accountData, updateAccount);
  }

  private findUpdateOrState(xdrArray: any[], accountId: string): any {
    return xdrArray
      .reverse()
      .reduce((accumulator: any[], x: any) => {
        let data: any;

        switch (x.switch()) {
          case changeType.ledgerEntryUpdated():
            data = x.updated().data();
            break;
          case changeType.ledgerEntryState():
            data = x.state().data();
            break;
        }

        if (data && data.switch() === ledgerEntryType.account()) {
          accumulator.push(data.account());
        }

        return accumulator;
      }, [])
      .find((account: any) => publicKeyFromXDR(account) === accountId);
  }
}
