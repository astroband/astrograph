import { accountSchema } from "./account";
import { dataEntrySchema } from "./data_entry";
import { ledgerSchema } from "./ledger";
import { transactionSchema } from "./transaction";

const schemas = [ledgerSchema, transactionSchema, dataEntrySchema, accountSchema];

export default schemas;
