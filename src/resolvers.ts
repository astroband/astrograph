import { accountResolver } from "./account/account.resolver";
import { dataEntryResolver } from "./data_entry/data_entry.resolver";
import { ledgerResolver } from "./ledger/ledger.resolver";
import { signerResolver } from "./signer/signer.resolver";
import { transactionResolver } from "./transaction/transaction.resolver";

const resolvers = [ledgerResolver, transactionResolver, signerResolver, dataEntryResolver, accountResolver];

export default resolvers;
