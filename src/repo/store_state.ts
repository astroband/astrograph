import { IDatabase } from "pg-promise";

const sql = {
  selectNetworkPassphrase: "SELECT state FROM storestate WHERE statename = 'networkpassphrase'"
};

export default class StoreStateRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  public async getStellarNetworkPassphrase(): Promise<string> {
    const res = await this.db.one(sql.selectNetworkPassphrase);
    return res.state;
  }
}
