export enum MutationType {
  Create = "CREATE",
  Update = "UPDATE",
  Remove = "REMOVE"
}

export interface IMutationType {
  mutationType: MutationType;
}
