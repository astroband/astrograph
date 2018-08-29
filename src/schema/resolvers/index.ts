import accountResolvers from "./account";
import dataEntryResolvers from "./data_entry";
import ledgerResolvers from "./ledger";
import ledgerLinkResolvers from "./ledger_link";
import signerResolvers from "./signer";
import transactionResolvers from "./transaction";
import trustLineResolvers from "./trust_line";

export default [
  accountResolvers,
  dataEntryResolvers,
  ledgerResolvers,
  ledgerLinkResolvers,
  signerResolvers,
  transactionResolvers,
  trustLineResolvers
];
