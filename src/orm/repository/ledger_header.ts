import { EntityRepository, MoreThan, Repository } from "typeorm";
import { LedgerHeader } from "../entities";

@EntityRepository(LedgerHeader)
export class LedgerHeaderRepository extends Repository<LedgerHeader> {
  public async findLast() {
    const qb = this.createQueryBuilder();
    return qb.orderBy("ledgerSeq", "DESC").getOne();
  }

  public async findBySeq(seq: number) {
    return this.findOne({ where: { ledgerSeq: seq } });
  }

  public async findFirstAfterBySeq(seq: number) {
    return this.findOne({ where: { ledgerSeq: MoreThan(seq) } });
  }

  public async findMinSeq() {
    const qb = this.createQueryBuilder();
    const row = await qb
      .select("ledgerSeq")
      .orderBy("ledgerSeq", "ASC")
      .getRawOne();

    return row.ledgerseq;
  }

  public async findMaxSeq() {
    const qb = this.createQueryBuilder();
    const row = await qb
      .select("ledgerSeq")
      .orderBy("ledgerSeq", "DESC")
      .getRawOne();

    return row.ledgerseq;
  }
}
