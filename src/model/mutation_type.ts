// Internal type, it is not reflected in schema directly.
export enum MutationType {
  Create = "CREATE",
  Update = "UPDATE",
  Remove = "REMOVE",
  State = "STATE"
}

export interface IMutationType {
  mutationType: MutationType;
}
