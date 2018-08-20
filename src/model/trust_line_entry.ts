import { EntryType, IEntryType } from "./entry_type";
import { TrustLine } from "./trust_line";

export class TrustLineEntry extends TrustLine implements IEntryType {
  public entryType: EntryType;

  constructor(entryType: EntryType, data: any) {
    super(data);
    this.entryType = entryType;
  }
}
