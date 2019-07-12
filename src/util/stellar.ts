import BigNumber from "bignumber.js";
import { Network } from "stellar-base";
import { getCustomRepository } from "typeorm";
import { Ledger } from "../model";
import { LedgerHeaderRepository } from "../orm/repository/ledger_header";
import { LEDGER_CREATED, pubsub } from "../pubsub";
import { setBaseReserve } from "./base_reserve";
import { STELLAR_NETWORK } from "./secrets";

export const STELLAR_AMOUNT_PRECISION = 7;

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
  return toFloat(amount).toFixed(STELLAR_AMOUNT_PRECISION);
}

export function toFloat(amount: string | number | BigNumber): BigNumber {
  return new BigNumber(amount).div(new BigNumber("1e" + STELLAR_AMOUNT_PRECISION));
}

export async function updateBaseReserve(): Promise<number> {
  const lastLedgerHeader = await getCustomRepository(LedgerHeaderRepository).findLast();

  if (!lastLedgerHeader) {
    throw new Error("No ledgers in the database!");
  }

  setBaseReserve(lastLedgerHeader.baseReserve);
  return lastLedgerHeader.baseReserve;
}

export function listenBaseReserveChange(): void {
  pubsub.subscribe(LEDGER_CREATED, (ledger: Ledger) => {
    if (!ledger.header) {
      return;
    }

    setBaseReserve(ledger.header.baseReserve);
  });
}
