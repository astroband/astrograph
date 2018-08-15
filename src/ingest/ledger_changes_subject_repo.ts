import { Event, IAccountID } from "./ledger_changes_repo";

export class LedgerChangesSubjectRepo {
  private changes: Event[];

  constructor(changes: Event[]) {
    this.changes = changes;
    this.load();
  }

  public load() {
    console.log(this.accountIDs());
  }

  public accountIDs() {
    return this.changes.map((c) => {
      if ((<IAccountID>c).accountID) {
        return c.accountID;
      }

      return null;
    }).filter(id => id !== null);
  }
}
