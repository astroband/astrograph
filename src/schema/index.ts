import { makeExecutableSchema, mergeSchemas } from "apollo-server";

import resolvers from "./resolvers";

import { typeDefs as accountsTypeDefs } from "./accounts";
import { typeDefs as assetsTypeDefs } from "./assets";
import { typeDefs as ledgerTypeDefs } from "./ledgers";
import { typeDefs as offersTypeDefs } from "./offers";
import { typeDefs as operationsTypeDefs } from "./operations";
import { typeDefs as orderBookTypeDefs } from "./order_book";
import { typeDefs as paymentPathTypeDefs } from "./payment_path";
import { typeDefs as tradesTypeDefs } from "./trades";
import { typeDefs as transactionsTypeDefs } from "./transactions";
import { typeDefs } from "./type_defs";

const schema = makeExecutableSchema({
  typeDefs: [
    typeDefs,
    accountsTypeDefs,
    assetsTypeDefs,
    ledgerTypeDefs,
    offersTypeDefs,
    transactionsTypeDefs,
    operationsTypeDefs,
    orderBookTypeDefs,
    paymentPathTypeDefs,
    tradesTypeDefs
  ],
  resolverValidationOptions: { requireResolversForResolveType: false }
});

export default mergeSchemas({
  schemas: [schema],
  resolvers,
  inheritResolversFromInterfaces: true
});
