import { accountResolver } from "./account";
import { dataEntryResolver } from "./data_entry";
import { ledgerResolver } from "./ledger";
import { signerResolver } from "./signer";
import { transactionResolver } from "./transaction";

const resolvers = [ledgerResolver, transactionResolver, signerResolver, dataEntryResolver, accountResolver];

export default resolvers;
