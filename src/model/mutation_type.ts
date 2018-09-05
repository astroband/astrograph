// Internal type, it is not reflected in schema directly.
export enum MutationType {
  Create = "CREATE",
  Update = "UPDATE",
  Remove = "REMOVE"
}

export interface IMutationType {
  mutationType: IMutationType;
}
