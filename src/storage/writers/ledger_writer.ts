import { LedgerHeader } from "../../model";
import { Connection } from "../connection";
import { Writer } from "./writer";

import * as nquads from "../nquads";

interface IContext {
  current: nquads.IValue;
  prev: nquads.IValue | null;
}

export class LedgerWriter extends Writer {
  private header: LedgerHeader;
  private context: IContext;

  private constructor(connection: Connection, header: LedgerHeader, context: IContext) {
    super(connection);

    this.header = header;
    this.context = context;
  }

  public async write(): Promise<nquads.IValue> {
    const { current, prev } = this.context;

    this.b
      .for(current)
      .append("type", "ledger")
      .append("seq", this.header.ledgerSeq)
      .append("sortHandle", this.header.ledgerSeq)
      .append("version", this.header.ledgerVersion)
      .append("baseFee", this.header.baseFee)
      .append("baseReserve", this.header.baseReserve)
      .append("maxTxSetSize", this.header.maxTxSetSize);

    if (prev) {
      this.b.append(current, "prev", prev).append(prev, "next", current);
    }

    const created = await this.push("ledger");
    return created || current;
  }
}
