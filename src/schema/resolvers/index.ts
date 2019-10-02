import accountResolvers from "./account";
import assetResolvers from "./asset";
import balanceResolvers from "./balance";
import dataEntryResolvers from "./data_entry";
import ledgerResolvers from "./ledger";
import offerResolvers from "./offer";
import operationResolvers from "./operation";
import orderBookResolvers from "./order_book";
import paymentPathResolvers from "./payment_path";
import tradeAggregationsResolvers from "./trade_aggregations";
import tradesResolvers from "./trades";
import transactionResolvers from "./transaction";

export default [
  accountResolvers,
  assetResolvers,
  // dataEntryResolvers,
  ledgerResolvers,
  // offerResolvers,
  // operationResolvers,
  // transactionResolvers,
  balanceResolvers,
  // orderBookResolvers,
  // paymentPathResolvers,
  // tradeAggregationsResolvers,
  // tradesResolvers
];
