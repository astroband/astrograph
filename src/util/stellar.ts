import BigNumber from "bignumber.js";
import { Keypair, Network } from "stellar-base";
import { db } from "../database";
import { Ledger } from "../model";
import { LEDGER_CREATED, pubsub } from "../pubsub";
import { STELLAR_NETWORK } from "./secrets";

setNetwork();

const StellarAmountPrecision = 7;

export const NATIVE_ASSET_CODE = "XLM";
export const NETWORK_MASTER_KEY = Keypair.master().publicKey();
// default value from current network state
// it would be updated from real stellar-core database on the app init
let baseReserve = 5000000;

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
  baseReserve = lastLedgerHeader.baseReserve;
}

export function setBaseReserve(newBaseReserve: number): void {
  baseReserve = newBaseReserve;
}

export function getReservedBalance(numSubentries: number) {
  return (2 + numSubentries) * baseReserve;
}

export function listenBaseReserveChange(): void {
  pubsub.subscribe(LEDGER_CREATED, (ledger: Ledger) => {
    if (!ledger.header) {
      return;
    }

    setBaseReserve(ledger.header.baseReserve);
  });
}
