import accountResolvers from "./account";
import dataEntryResolvers from "./data_entry";
import ledgerResolvers from "./ledger";
import operationResolvers from "./operation";
import signerResolvers from "./signer";
import transactionResolvers from "./transaction";
import trustLineResolvers from "./trust_line";

export default [
  accountResolvers,
  dataEntryResolvers,
  ledgerResolvers,
  operationResolvers,
  signerResolvers,
  transactionResolvers,
  trustLineResolvers
];
