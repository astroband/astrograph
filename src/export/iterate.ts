import _ from "lodash";
import { db } from "../database";
import logger from "../util/logger";

export default async function iterate(min: number, max: number, cb: any) {
  let totalTimes = [];
  let ingestTimes = [];

  for (let n = min; n <= max; n++) {
    const totalStart = _.now();

    if (n % 1000 === 0) {
      logger.debug(`Average total time for last 1000 ledgers: ${_.sum(totalTimes) / totalTimes.length}`);
      logger.debug(`Average ingest time for last 1000 ledgers: ${_.sum(ingestTimes) / ingestTimes.length}`);
      totalTimes = [];
      ingestTimes = [];
    }

    let header = await db.ledgerHeaders.findBySeq(n);

    if (!header) {
      header = await db.ledgerHeaders.findFirstAfterBySeq(n);
      if (header && header.ledgerSeq < max) {
        n = header.ledgerSeq;
      } else {
        n = max + 1;
        continue;
      }
    }

    const transactions = await db.transactions.findAllBySeq(header.ledgerSeq);

    const ingestStart = _.now();
    await cb(header, transactions);

    ingestTimes.push(_.now() - ingestStart);
    totalTimes.push(_.now() - totalStart);
  }
}
