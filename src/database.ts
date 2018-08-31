// Bluebird is the best promise library available today, and is the one recommended here:
import * as promise from "bluebird";
import { IDatabase, IMain, IOptions } from "pg-promise";

// Loading and initializing pg-promise:
import pgPromise = require("pg-promise");

import * as secrets from "./common/util/secrets";

import AccountsRepo from "./repo/accounts";
import DataEntriesRepo from "./repo/data_entries";
import LedgerHeadersRepo from "./repo/ledger_headers";
import SignersRepo from "./repo/signers";
import TransactionFeesRepo from "./repo/transaction_fees";
import TransactionsRepo from "./repo/transactions";
import TrustLinesRepo from "./repo/trust_lines";

// Database Interface Extensions:
interface IExtensions {
  accounts: AccountsRepo;
  dataEntries: DataEntriesRepo;
  ledgerHeaders: LedgerHeadersRepo;
  signers: SignersRepo;
  transactions: TransactionsRepo;
  transactionFees: TransactionFeesRepo;
  trustLines: TrustLinesRepo;
}

// pg-promise initialization options:
const initOptions: IOptions<IExtensions> = {
  promiseLib: promise,

  extend(obj: IExtensions) {
    // Do not use 'require()' here, because this event occurs for every task
    // and transaction being executed, which should be as fast as possible.
    obj.accounts = new AccountsRepo(obj);
    obj.dataEntries = new DataEntriesRepo(obj);
    obj.ledgerHeaders = new LedgerHeadersRepo(obj);
    obj.signers = new SignersRepo(obj);
    obj.transactions = new TransactionsRepo(obj);
    obj.transactionFees = new TransactionFeesRepo(obj);
    obj.trustLines = new TrustLinesRepo(obj);
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
