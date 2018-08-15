import stellar from "stellar-base";

enum OperationType {
  Create = "CREATE",
  Update = "UPDATE",
  Remove = "REMOVE"
}

interface IAccountID {
  accountID: string;
}

interface IOperation {
  operation: OperationType;
}

type AccountEvent = IOperation & IAccountID;

// interface Asset {
//   type: number;
//   code: string;
//   issuer: string;
// }
// type TrustLineEvent = Operation & AccountID & Asset;

export class LedgerChangesRepo {
  public accounts: AccountEvent[];

  public constructor() {
    this.accounts = [];
  }

  public push(xdr: any) {
    for (const change of xdr) {
      this.fetch(change);
    }
  }

  private fetch(xdr: any) {
    const t = stellar.xdr.LedgerEntryChangeType;

    switch (xdr.switch()) {
      case t.ledgerEntryCreated():
        console.log("Created");
        this.fetchCreate(xdr.created().data());
        break;

      case t.ledgerEntryUpdated():
        this.fetchUpdate(xdr.updated().data());
        break;

      case t.ledgerEntryRemoved():
        this.fetchRemove(xdr.removed());
        break;
    }
  }

  private fetchCreate(xdr: any) {
    const t = stellar.xdr.LedgerEntryType;

    switch (xdr.switch()) {
      case t.account():
        this.pushAccountEvent(OperationType.Create, xdr);
        break;
    }
  }

  private fetchUpdate(xdr: any) {
    const t = stellar.xdr.LedgerEntryType;

    switch (xdr.switch()) {
      case t.account():
        this.pushAccountEvent(OperationType.Update, xdr);
        break;
    }
  }

  private fetchRemove(xdr: any) {
    const t = stellar.xdr.LedgerEntryType;

    switch (xdr.switch()) {
      case t.account():
        this.pushAccountEvent(OperationType.Remove, xdr);
        break;
    }
  }

  private stringifyAccountID(value: Buffer): string {
    return stellar.StrKey.encodeEd25519PublicKey(value);
  }

  private pushAccountEvent(operation: OperationType, xdr: any) {
    const accountID = this.stringifyAccountID(xdr.account().accountId().value());
    this.accounts.push({ operation, accountID });
  }
}
