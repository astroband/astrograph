import Big from "big.js";
import { Keypair, Network } from "stellar-base";
import db from "../database";
import { Asset } from "../model";

const StellarAmountPrecision = 7;

export const NATIVE_ASSET_CODE = "XLM";

export async function setNetwork(): Promise<string> {
  const promise = db.storeState.getStellarNetworkPassphrase().then((networkPassphrase: string) => {
    Network.use(new Network(networkPassphrase));
    return networkPassphrase;
  });

  return promise;
}

export function buildNativeAsset(): Asset {
  return new Asset(true, NATIVE_ASSET_CODE, Keypair.master().publicKey());
}

// converts amounts according to Stellar precision like this:
// "99999999800" -> "9999.9999800"
export function toFloatAmountString(intAmountString: string): string {
  const floatAmount = new Big(intAmountString);
  return floatAmount.div(new Big("1e" + StellarAmountPrecision)).toFixed(StellarAmountPrecision);
}
