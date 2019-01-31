import Big from "big.js";
import { Keypair, Network } from "stellar-base";
import { STELLAR_NETWORK } from "./secrets";

setNetwork();

const StellarAmountPrecision = 7;

export const NATIVE_ASSET_CODE = "XLM";
export const NETWORK_MASTER_KEY = Keypair.master().publicKey();

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
export function toFloatAmountString(intAmountString: string): string {
  const floatAmount = new Big(intAmountString);
  return floatAmount.div(new Big("1e" + StellarAmountPrecision)).toFixed(StellarAmountPrecision);
}
