// Bluebird is the best promise library available today, and is the one recommended here:
import * as promise from "bluebird";
import { IDatabase, IMain, IOptions } from "pg-promise";

// Loading and initializing pg-promise:
import pgPromise = require("pg-promise");

import * as secrets from "./common/util/secrets";

import AccountsRepository from "./account/account.repo";
import LedgersRepository from "./ledger/ledger.repo";
import TransactionsRepository from "./transaction/transaction.repo";
import TransactionFeesRepository from "./transaction_fee/transaction_fee.repo";

// Database Interface Extensions:
interface IExtensions {
  ledgers: LedgersRepository;
  accounts: AccountsRepository;
  transactions: TransactionsRepository;
  transactionFees: TransactionFeesRepository;
}

// pg-promise initialization options:
const initOptions: IOptions<IExtensions> = {
  promiseLib: promise,

  extend(obj: IExtensions) {
    // Do not use 'require()' here, because this event occurs for every task
    // and transaction being executed, which should be as fast as possible.
    obj.ledgers = new LedgersRepository(obj);
    obj.accounts = new AccountsRepository(obj);
    obj.transactions = new TransactionsRepository(obj);
    obj.transactionFees = new TransactionFeesRepository(obj);
  }
};

const config = {
  host: secrets.DBHOST,
  port: secrets.DBPORT,
  database: secrets.DB,
  user: secrets.DBUSER,
  password: secrets.DBPASSWORD
};

const pgp: IMain = pgPromise(initOptions);

// Create the database instance with extensions:
const db = pgp(config) as IDatabase<IExtensions> & IExtensions;

// Load and initialize optional diagnostics:
import diagnostics = require("./common/db/diagnostics");

diagnostics.init(initOptions);

// If you ever need access to the library's root (pgp object), you can do it via db.$config.pgp
// See: http://vitaly-t.github.io/pg-promise/Database.html#.$config
export = db;
