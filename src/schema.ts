import { accountSchema } from "./account";
import { dataEntrySchema } from "./data_entry";
import { ledgerSchema } from "./ledger";
import { signerSchema } from "./signer";
import { transactionSchema } from "./transaction";

const schemas = [ledgerSchema, signerSchema, transactionSchema, dataEntrySchema, accountSchema];

export default schemas;
