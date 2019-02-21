import accountResolvers from "./account";
import assetResolvers from "./asset";
import dataEntryResolvers from "./data_entry";
import ledgerResolvers from "./ledger";
import offerResolvers from "./offer";
import operationResolvers from "./horizon_operation";
import signerResolvers from "./signer";
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
  trustLineResolvers
];
