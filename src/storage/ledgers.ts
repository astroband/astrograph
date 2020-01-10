import { LedgerHeader } from "../model";
import { LedgerHeaderFactory } from "../model/factories";
import { BaseStorage } from "./base";

export class LedgersStorage extends BaseStorage {
  public static async minSeq(): Promise<number> {
    return new LedgersStorage().minSeq();
  }

  public static async maxSeq(): Promise<number> {
    return new LedgersStorage().maxSeq();
  }

  public static async findBySeq(seq: number): Promise<LedgerHeader> {
    const header = await new LedgersStorage().addTerm({ seq }).one();

    return header as LedgerHeader;
  }

  public async minSeq(): Promise<number> {
    const aggregations = await this.aggregation({
      minSeq: { min: { field: "seq" } }
    });

    return aggregations.minSeq.value;
  }

  public async maxSeq(): Promise<number> {
    const aggregations = await this.aggregation({
      maxSeq: { max: { field: "seq" } }
    });

    return aggregations.maxSeq.value;
  }

  protected get elasticIndexName() {
    return "ledger";
  }

  protected convertRawDoc(doc: any): LedgerHeader {
    return LedgerHeaderFactory.fromStorage(doc);
  }
}
