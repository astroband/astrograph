// Internal type, it is not reflected in schema directly.
export enum EntryType {
  Create = "CREATE",
  Update = "UPDATE",
  Remove = "REMOVE"
}

export interface IEntryType {
  entryType: EntryType;
}
