import { ledgerResolver } from "./ledger";
import { transactionResolver } from "./transaction";
import { accountResolver } from "./account";

const resolvers = [ledgerResolver, transactionResolver, accountResolver];

export default resolvers;
