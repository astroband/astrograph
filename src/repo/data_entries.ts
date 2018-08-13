import { IDatabase } from "pg-promise";
import { DataEntry } from "../model";

export default class DataEntriesRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  public async findAllByAccountID(id: string): Promise<DataEntry[]> {
    const res = await this.db.manyOrNone("SELECT * FROM accountdata WHERE accountid = $1 ORDER BY dataname", id);
    return res.map(e => new DataEntry(e));
  }

  public async findAllByAccountIDs(ids: string[]): Promise<DataEntry[][]> {
    const res = await this.db.manyOrNone("SELECT * FROM accountdata WHERE accountid IN ($1) ORDER BY dataname", ids);
    return ids.map(id => res.filter(r => r.accountid === id).map(s => new DataEntry(s)));
  }
}
