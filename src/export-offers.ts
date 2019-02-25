import fs from "fs";
import zlib from "zlib";
import { db } from "./database";
import { IOfferTableRow, OfferFactory } from "./model/factories/offer_factory";
import { OfferBuilder } from "./storage/builders/offer";
import logger from "./util/logger";

const fileName = `export/offers-${new Date().toISOString()}.rdf.gz`;

async function exportOffers(): Promise<number> {
  const batchSize = 1000;
  let offset = 0;
  const offersCount = await db.offers.count();

  const batchesCount = Math.ceil(offersCount / batchSize);
  const file = zlib.createGzip();
  file.pipe(fs.createWriteStream(fileName));

  for (let i = 0; i < batchesCount; i += 1) {
    const rows: IOfferTableRow[] = await db.any("SELECT * FROM offers LIMIT $1 OFFSET $2", [batchSize, offset]);

    rows.forEach(row => {
      const offer = OfferFactory.fromDb(row);
      const builder = new OfferBuilder(offer);

      file.write(builder.build().toString() + "\n");
    });

    offset += batchSize;
  }

  file.end();

  return offersCount;
}

exportOffers().then((offersCount: number) => {
  logger.info(`${offersCount} offers have been exported into "${fileName}"`);
});
