import { dataSource } from "../database";
import { LedgerHeader } from "../model";
import { LedgersStorage } from "../storage/ledgers";
import { STELLAR_CORE_CURSOR_NAME } from "../util/secrets";

export class Cursor {
  public static async build(seq?: number) {
    let cursorValue: number;

    if (seq) {
      cursorValue = seq === -1 ? await LedgersStorage.minSeq() : seq;
    } else {
      const coreCursor = await Cursor.getCursorFromDatabase();

      if (coreCursor) {
        cursorValue = coreCursor;
      } else {
        cursorValue = (await LedgersStorage.maxSeq()) + 1;
      }
    }

    await Cursor.updateCursorInDatabase(cursorValue);
    return new Cursor(cursorValue);
  }

  private static async getCursorFromDatabase(): Promise<number | null> {
    const rows = await dataSource.manager.query("SELECT lastread FROM pubsub WHERE resid = $1", [
      STELLAR_CORE_CURSOR_NAME
    ]);
    return rows[0] ? rows[0].lastread : null;
  }

  private static async updateCursorInDatabase(value: number): Promise<void> {
    await dataSource.manager.query("UPDATE pubsub SET lastread = $1 WHERE resid = $2", [
      value,
      STELLAR_CORE_CURSOR_NAME
    ]);
  }

  constructor(private seq: number) {}

  get current(): number {
    return this.seq;
  }

  // Returns next ledger object and transactions
  public async nextLedger(): Promise<LedgerHeader | null> {
    const header = await LedgersStorage.findBySeq(this.seq);

    // If there is no next ledger
    if (header == null) {
      const maxSeq = await LedgersStorage.maxSeq();

      // And there is a ledger somewhere forward in history (it is the gap)
      if (this.seq < maxSeq) {
        this.seq = maxSeq; // Fast-rewind to lastest ledger
      }

      return null;
    }

    this.seq += 1;
    await Cursor.updateCursorInDatabase(this.seq);

    return header;
  }
}
