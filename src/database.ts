// Bluebird is the best promise library available today, and is the one recommended here:
import promise from "bluebird";
import { IDatabase, IInitOptions, IMain } from "pg-promise";
import { DataSource } from "typeorm";

// Loading and initializing pg-promise:
import pgPromise = require("pg-promise");
import diagnostics = require("./util/db/diagnostics");

import { DATABASE_URL } from "./util/secrets";

import { Account, AccountData, Asset, LedgerHeader, Offer, TrustLine } from "./orm/entities";

import LedgerHeadersRepo from "./repo/ledger_headers";
import StoreStateRepo from "./repo/store_state";
import TransactionsRepo from "./repo/transactions";

// Database Interface Extensions:
interface IExtensions {
  ledgerHeaders: LedgerHeadersRepo;
  transactions: TransactionsRepo;
  storeState: StoreStateRepo;
}

// pg-promise initialization options:
const initOptions: IInitOptions<IExtensions> = {
  promiseLib: promise,

  extend(obj: IExtensions) {
    // Do not use 'require()' here, because this event occurs for every task
    // and transaction being executed, which should be as fast as possible.
    obj.ledgerHeaders = new LedgerHeadersRepo(obj);
    obj.transactions = new TransactionsRepo(obj);
    obj.storeState = new StoreStateRepo(obj);
  }
};

const pgp: IMain = pgPromise(initOptions);

// Create the database instance with extensions:
export const db = pgp(DATABASE_URL) as IDatabase<IExtensions> & IExtensions & IMain;

// Load and initialize optional diagnostics:
diagnostics.init(initOptions);

const queryStart = DATABASE_URL.indexOf("?");

export const dataSource = new DataSource({
  type: "postgres",
  url: queryStart !== -1 ? DATABASE_URL.slice(0, queryStart) : DATABASE_URL,
  entities: [Account, AccountData, Asset, Offer, LedgerHeader, TrustLine],
  synchronize: false,
  logging: process.env.DEBUG_SQL !== undefined
});

// If you ever need access to the library's root (pgp object), you can do it via db.$config.pgp
// See: http://vitaly-t.github.io/pg-promise/Database.html#.$config
