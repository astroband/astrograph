import { Account } from "./account";
import { EntryType, IEntryType } from "./entry_type";

export class AccountEntry extends Account implements IEntryType {
  public entryType: EntryType;

  constructor(entryType: EntryType, data: any) {
    super(data);
    this.entryType = entryType;
  }
}
