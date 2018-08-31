import accountResolvers from "./account";
import dataEntryResolvers from "./data_entry";
import ledgerResolvers from "./ledger";
import signerResolvers from "./signer";
import transactionResolvers from "./transaction";
import trustLineResolvers from "./trust_line";

export default [
  accountResolvers,
  dataEntryResolvers,
  ledgerResolvers,
  signerResolvers,
  transactionResolvers,
  trustLineResolvers
];
