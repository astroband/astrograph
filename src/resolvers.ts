import { accountResolver } from "./account";
import { ledgerResolver } from "./ledger";
import { transactionResolver } from "./transaction";

const resolvers = [ledgerResolver, transactionResolver, accountResolver];

export default resolvers;
