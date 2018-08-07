import { ledgerResolver } from "./ledger";
import { transactionResolver } from "./transaction";
const resolvers = [ledgerResolver, transactionResolver];

export default resolvers;
