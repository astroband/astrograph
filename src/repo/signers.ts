import _ from "lodash";
import { IDatabase } from "pg-promise";
import { Signer } from "../model2";
import { ISignerTableRow, SignerFactory } from "../model2/factories/signer_factory";

const sql = {
  selectSigners: "SELECT * FROM signers WHERE accountid = $1 ORDER BY publickey",
  selectSignersIn: "SELECT * FROM signers WHERE accountid IN ($1:csv) ORDER BY publickey"
};

export default class SignersRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  public async findAllByAccountID(id: string): Promise<Signer[]> {
    const res = await this.db.manyOrNone(sql.selectSigners, id);
    return res.map((e: ISignerTableRow) => SignerFactory.fromDb(e));
  }

  public async findAllByAccountIDs(ids: string[]): Promise<Signer[][]> {
    const res = await this.db.manyOrNone(sql.selectSignersIn, [_.uniq(ids)]);
    return ids.map(id => res.filter(r => r.accountid === id).map((s: ISignerTableRow) => SignerFactory.fromDb(s)));
  }
}
