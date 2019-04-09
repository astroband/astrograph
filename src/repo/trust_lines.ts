import _ from "lodash";
import { IDatabase } from "pg-promise";
import { IBalance } from "../model";
import { BalanceFactory, ITrustLineTableRow } from "../model/factories";
import { joinToMap } from "../util/array";

const sql = {
  selectTrustLines: "SELECT * FROM trustlines WHERE accountid = $1 ORDER BY assettype, assetcode",
  selectTrustLinesIn: "SELECT * FROM trustlines WHERE accountid IN ($1:csv) ORDER BY assettype, assetcode"
};

export default class TrustLinesRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  public async findAllByAccountID(id: string): Promise<IBalance[]> {
    const res = await this.db.manyOrNone(sql.selectTrustLines, id);
    return res.map((r: ITrustLineTableRow) => BalanceFactory.fromDb(r));
  }

  public async findAllByAccountIDs(ids: string[]): Promise<IBalance[][]> {
    const res = await this.db.manyOrNone(sql.selectTrustLinesIn, [_.uniq(ids)]);
    return ids.map(id => res.filter(r => r.accountid === id).map((s: ITrustLineTableRow) => BalanceFactory.fromDb(s)));
  }

  public async findAllMapByAccountIDs(ids: string[]): Promise<Map<string, IBalance[]>> {
    if (ids.length === 0) {
      return new Map<string, IBalance[]>();
    }

    const res = await this.findAllByAccountIDs(ids);
    return joinToMap<string, IBalance[]>(ids, res);
  }
}
