import { accountSchema } from "./account";
import { ledgerSchema } from "./ledger";
import { transactionSchema } from "./transaction";

const schemas = [ledgerSchema, transactionSchema, accountSchema];

export default schemas;
