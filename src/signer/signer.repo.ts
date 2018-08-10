import { IDatabase } from "pg-promise";
import Signer from "./signer.model";

export default class SignersRepository {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  public async findAllByAccountID(id: string): Promise<Signer[]> {
    const res = await this.db.manyOrNone("SELECT * FROM signers WHERE accountid = $1", id);
    return res.map(e => new Signer(e));
  }
}
