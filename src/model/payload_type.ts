// Internal type, it is not reflected in schema directly.
export enum PayloadType {
  Create = "CREATE",
  Update = "UPDATE",
  Remove = "REMOVE"
}

export interface IPayloadType {
  payloadType: PayloadType;
}
