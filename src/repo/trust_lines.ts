import { IDatabase } from "pg-promise";
import { TrustLine } from "../model";
import { joinToMap, unique } from "../util/array";

const sql = {
  selectTrustLines: "SELECT * FROM trustlines WHERE accountid = $1 ORDER BY assettype, assetcode",
  selectTrustLinesIn: "SELECT * FROM trustlines WHERE accountid IN ($1:csv) ORDER BY assettype, assetcode"
};

export default class TrustLinesRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  public async findAllByAccountID(id: string): Promise<TrustLine[]> {
    const res = await this.db.manyOrNone(sql.selectTrustLines, id);
    return res.map(e => new TrustLine(e));
  }

  public async findAllByAccountIDs(ids: string[]): Promise<TrustLine[][]> {
    const res = await this.db.manyOrNone(sql.selectTrustLinesIn, [ids.filter(unique)]);
    return ids.map(id => res.filter(r => r.accountid === id).map(s => new TrustLine(s)));
  }

  public async findAllMapByAccountIDs(ids: string[]): Promise<Map<string, TrustLine[]>> {
    if (ids.length === 0) {
      return new Map<string, TrustLine[]>();
    }

    const res = await this.findAllByAccountIDs(ids);
    return joinToMap<string, TrustLine[]>(ids, res);
  }
}
