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
  file: any;
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

  minSeq = isNaN(count) ? await db.ledgerHeaders.findMinSeq() : maxSeq - count + 1;

  const total = await db.ledgerHeaders.countInRange(minSeq, maxSeq);

  return { minSeq, maxSeq, total };
};

const openCsv = (r: string): any => {
  const fileName = `./export/${r}.nquads.gz`;

  const file = zlib.createGzip();
  file.pipe(fs.createWriteStream(fileName));

  return file;
};

export async function configure(): Promise<IConfig> {
  setNetwork();
  const { minSeq, maxSeq, total } = await setLimits();
  const file = openCsv(`${minSeq}-${maxSeq}`);
  return { minSeq, maxSeq, total, file };
}
