import accountResolvers from "./account";
import assetResolvers from "./asset";
import dataEntryResolvers from "./data_entry";
import ledgerResolvers from "./ledger";
import offerResolvers from "./offer";
import operationResolvers from "./operation";
import orderBookResolvers from "./order_book";
import paymentPathResolvers from "./payment_path";
import signerResolvers from "./signer";
import tradeAggregationsResolvers from "./trade_aggregations";
import transactionResolvers from "./transaction";
import trustLineResolvers from "./trust_line";

export default [
  accountResolvers,
  assetResolvers,
  dataEntryResolvers,
  ledgerResolvers,
  offerResolvers,
  operationResolvers,
  signerResolvers,
  transactionResolvers,
  trustLineResolvers,
  orderBookResolvers,
  paymentPathResolvers,
  tradeAggregationsResolvers
];
