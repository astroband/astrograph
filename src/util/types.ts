import { DatabaseClient } from "../database";
import { Dgraph } from "../storage/dgraph";
export type AccountID = string;
export type AssetCode = string;

export interface IApolloContext {
  dgraph: Dgraph;
  db: DatabaseClient;
}
