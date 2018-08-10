import { IDatabase } from "pg-promise";
import DataEntry from "./data_entry.model";

export default class DataEntriesRepository {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  public async findAllByAccountID(id: string): Promise<DataEntry[]> {
    const res = await this.db.oneOrNone("SELECT * FROM accountdata WHERE accountid = $1", id);
    return res.map(t => new DataEntry(t));
  }
}
