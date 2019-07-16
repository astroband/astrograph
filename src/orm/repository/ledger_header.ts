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
    const header = await this.findOneOrFail({ order: { ledgerSeq: "ASC" } });
    return header.ledgerSeq;
  }

  public async findMaxSeq() {
    const header = await this.findOneOrFail({ order: { ledgerSeq: "DESC" } });
    return header.ledgerSeq;
  }
}
