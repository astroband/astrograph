import BigNumber from "bignumber.js";
import { Network } from "stellar-base";
import { db } from "../database";
import { Ledger } from "../model";
import { LEDGER_CREATED, pubsub } from "../pubsub";
import { setBaseReserve } from "./base_reserve";
import { STELLAR_NETWORK } from "./secrets";

const StellarAmountPrecision = 7;

export type MemoType = "hash" | "return" | "text" | "id";

export function setNetwork() {
  if (STELLAR_NETWORK === "pubnet") {
    Network.usePublicNetwork();
  } else if (STELLAR_NETWORK === "testnet") {
    Network.useTestNetwork();
  } else {
    throw new Error(`Unknown STELLAR_NETWORK "${STELLAR_NETWORK}"`);
  }

  return Network.current().networkPassphrase();
}

// converts amounts according to Stellar precision like this:
// "99999999800" -> "9999.9999800"
export function toFloatAmountString(amount: string | number | BigNumber): string {
  const floatAmount = !(amount instanceof BigNumber) ? new BigNumber(amount) : amount;
  return floatAmount.div(new BigNumber("1e" + StellarAmountPrecision)).toFixed(StellarAmountPrecision);
}

export async function updateBaseReserve(): Promise<void> {
  const lastLedgerHeader = await db.ledgerHeaders.getLastLedgerHeader();
  setBaseReserve(lastLedgerHeader.baseReserve);
}

export function listenBaseReserveChange(): void {
  pubsub.subscribe(LEDGER_CREATED, (ledger: Ledger) => {
    if (!ledger.header) {
      return;
    }

    setBaseReserve(ledger.header.baseReserve);
  });
}
