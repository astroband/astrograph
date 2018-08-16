import { IDatabase } from "pg-promise";
import { TrustLine } from "../model";

export default class TrustLinesRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  public async findAllByAccountID(id: string): Promise<TrustLine[]> {
    const res = await this.db.manyOrNone(
      "SELECT * FROM trustlines WHERE accountid = $1 ORDER BY assettype, assetcode",
      id
    );
    return res.map(e => new TrustLine(e));
  }

  public async findAllByAccountIDs(ids: string[]): Promise<TrustLine[][]> {
    const res = await this.db.manyOrNone(
      "SELECT * FROM trustlines WHERE accountid IN ($1:csv) ORDER BY assettype, assetcode",
      [ids]
    );
    return ids.map(id => res.filter(r => r.accountid === id).map(s => new TrustLine(s)));
  }
}
