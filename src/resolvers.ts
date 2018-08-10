import { accountResolver } from "./account";
import { dataEntryResolver } from "./data_entry";
import { ledgerResolver } from "./ledger";
import { transactionResolver } from "./transaction";

const resolvers = [ledgerResolver, transactionResolver, dataEntryResolver, accountResolver];

export default resolvers;
