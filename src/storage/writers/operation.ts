import { Connection } from "../connection";
import { Writer } from "./writer";

export class Operation extends Writer {
  private txUID: string;
  private op: any;
  private index: number;

  constructor(connection: Connection, txUID: string, op: any, index: number) {
    super(connection);

    this.txUID = txUID;
    this.op = op;
    this.index = index;

    console.log(this.op);
  }

  public async write(): Promise<string> {
    const { prev, next, current } = await this.prevNextCurrent(this.vars());
    const uid = this.newOrUID(current, "operation");

    let nquads = this.baseNQuads(uid);
    nquads += this.prevNQuads(uid, prev);
    nquads += this.nextNQuads(uid, next);

    const result = await this.connection.push(nquads);
    const txUID = result.getUidsMap().get("operation") || current.uid;

    return txUID;
  }

  protected prevNextCurrentQuery() {
    return `
      query prevNextCurrent($id: string, $prevIndex: int, $nextIndex) {
        prev(func: eq(type, "operation")) @filter(eq(transaction, $id) AND eq(index, $prevIndex)) {
          uid
        }

        next(func: eq(type, "operation")) @filter(eq(transaction, $id) AND eq(index, $nextIndex)) {
          uid
        }

        current(func: eq(type, "operation")) @filter(eq(transaction, $id)) {
          uid
        }
      }
    `;
  }

  private baseNQuads(uid: string): string {
    return `
      ${uid} <type> "operation" .
      ${uid} <transaction> <"${this.txUID}"> .
      ${uid} <index> "${this.index}" .

      <${this.txUID}> <operations> ${uid} .
    `;
  }

  private vars(): any {
    return {
      $id: this.txUID,
      $prevIndex: (this.index - 1).toString(),
      $nextIndex: (this.index + 1).toString()
    };
  }
}
