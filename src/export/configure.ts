import fs from "fs";
import parseArgv from "minimist";
import zlib from "zlib";
import { db } from "../database";
import logger from "../util/logger";
import { setNetwork as setStellarNetwork } from "../util/stellar";

export interface IConfig {
  minSeq: number;
  maxSeq: number;
  total: number;
  gzip: any;
  csv: any;
}

const setNetwork = () => {
  const network = setStellarNetwork();
  logger.info(`Using ${network}`);
};

const setLimits = async (): Promise<any> => {
  const args = parseArgv(process.argv.slice(2));

  const count: number = Number.parseInt(args._[0], 10);
  let maxSeq: number = Number.parseInt(args._[1], 10);
  let minSeq: number | null = null;

  if (isNaN(maxSeq)) {
    maxSeq = await db.ledgerHeaders.findMaxSeq();
  }

  minSeq = isNaN(count) ? await db.ledgerHeaders.findMinSeq() : maxSeq - count;

  const total = await db.ledgerHeaders.countInRange(minSeq, maxSeq);

  return { minSeq, maxSeq, total };
};

const openCsv = (r: string): any => {
  const root = `./exports/${r}`;

  fs.mkdir(root, { recursive: true }, err => {
    if (err) {
      throw err;
    }
  });

  const gzip = {
    ledger: zlib.createGzip(),
    ledgerR: zlib.createGzip()
  };

  const csv = {
    ledger: gzip.ledger.pipe(fs.createWriteStream(`${root}/ledgers.csv.gz`)),
    ledgerR: gzip.ledgerR.pipe(fs.createWriteStream(`${root}/ledgers-relations.csv.gz`))
  };

  return { gzip, csv };
};

export async function configure(): Promise<IConfig> {
  setNetwork();
  const { minSeq, maxSeq, total } = await setLimits();
  const { gzip, csv } = openCsv(`${minSeq}-${maxSeq}`);
  return { minSeq, maxSeq, total, gzip, csv };
}
