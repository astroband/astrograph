import { IDatabase } from "pg-promise";
import { Signer } from "../model";

export default class SignersRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  public async findAllByAccountID(id: string): Promise<Signer[]> {
    const res = await this.db.manyOrNone("SELECT * FROM signers WHERE accountid = $1 ORDER BY publickey", id);
    return res.map(e => new Signer(e));
  }

  public async findAllByAccountIDs(ids: string[]): Promise<Signer[][]> {
    const res = await this.db.manyOrNone("SELECT * FROM signers WHERE accountid IN ($1:csv) ORDER BY publickey", [ids]);
    return ids.map(id => res.filter(r => r.accountid === id).map(s => new Signer(s)));
  }
}
