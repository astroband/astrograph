import { db } from "../database";

export default async function iterate(min: number, max: number, cb: any) {
  for (let n = min; n <= max; n++) {
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

    await cb(header, transactions);
  }
}
