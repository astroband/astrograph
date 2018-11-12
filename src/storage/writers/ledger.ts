import { LedgerHeader } from "../../model";
import { Connection } from "../connection";
import { Writer } from "./writer";

import * as nquads from "../nquads";

export class LedgerWriter extends Writer {
  public static async build(connection: Connection, header: LedgerHeader): Promise<LedgerWriter> {
    const writer = new LedgerWriter(connection, header);
    await writer.loadContext();
    return writer;
  }

  private header: LedgerHeader;
  private current: nquads.Value;
  private prev: nquads.Value | null = null;

  protected constructor(connection: Connection, header: LedgerHeader) {
    super(connection);
    this.header = header;
    this.current = new nquads.Blank(`ledger_${header.ledgerSeq}`);
  }

  public async write(): Promise<nquads.Value> {
    this.appendRoot();
    this.appendPrev(this.current, this.prev);

    const created = await this.push(`ledger_${this.header.ledgerSeq}`);
    return created || this.current;
  }

  protected async loadContext() {
    const { current, prev } = await this.connection.repo.ledger(this.header);

    this.current = current || this.current;
    this.prev = prev;
  }

  private appendRoot() {
    this.b
      .for(this.current)
      .append("type", "ledger")
      .append("seq", this.header.ledgerSeq)
      .append("order", this.header.ledgerSeq)
      .append("version", this.header.ledgerVersion)
      .append("base_fee", this.header.baseFee)
      .append("base_reserve", this.header.baseReserve)
      .append("max_tx_set_size", this.header.maxTxSetSize)
      .append("close_time", this.header.closeTime.toISOString());
  }
}
