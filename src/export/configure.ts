import fs from "fs";
import parseArgv from "minimist";
import { db } from "../database";
import "../util/asset";
import logger from "../util/logger";
import { setNetwork as setStellarNetwork } from "../util/stellar";

const EXPORT_BASE_DIR = "./export";

export interface IConfig {
  minSeq: number;
  maxSeq: number;
  total: number;
  dirPath: string;
  sliceSize: number;
}

const setNetwork = () => {
  const network = setStellarNetwork();
  logger.info(`Using ${network}`);
};

const parseArguments = () => {
  const args = parseArgv(process.argv.slice(2));

  const count: number = Number.parseInt(args._[0], 10);
  const maxSeq: number = Number.parseInt(args._[1], 10);
  const sliceSize = args.slice;

  return { count, maxSeq, sliceSize };
};

const setLimits = async (count: number, maxSeq: number): Promise<any> => {
  let minSeq: number | null = null;

  if (isNaN(maxSeq)) {
    maxSeq = await db.ledgerHeaders.findMaxSeq();
  }

  minSeq = isNaN(count) ? await db.ledgerHeaders.findMinSeq() : maxSeq - count + 1;

  const total = await db.ledgerHeaders.countInRange(minSeq, maxSeq);

  return { minSeq, maxSeq, total };
};

const makeDir = async (path: string) => {
  if (fs.existsSync(path)) {
    throw new Error(`File ${path} exists. Please remove it and start over`);
  }

  await fs.mkdir(path, { recursive: true }, (err: any) => {
    if (err) {
      throw err;
    }
  });
};

export async function configure(): Promise<IConfig> {
  setNetwork();
  const { count, maxSeq: maxSeqArg, sliceSize } = parseArguments();
  const { minSeq, maxSeq, total } = await setLimits(count, maxSeqArg);

  const dirPath = `${EXPORT_BASE_DIR}/${minSeq}-${maxSeq}`;

  logger.info(`Creating directory ${dirPath} to store RDF files...`);
  await makeDir(dirPath);

  return { minSeq, maxSeq, total, dirPath, sliceSize: sliceSize || 100000 };
}
