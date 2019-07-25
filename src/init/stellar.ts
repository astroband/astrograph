import { Network } from "stellar-base";
import { db } from "../database";
import { setBaseReserve } from "../util/base_reserve";
import { STELLAR_NETWORK } from "../util/secrets";

export function setStellarNetwork(): Promise<string> {
  if (STELLAR_NETWORK === "pubnet") {
    Network.usePublicNetwork();
  } else if (STELLAR_NETWORK === "testnet") {
    Network.useTestNetwork();
  } else {
    throw new Error(`Unknown STELLAR_NETWORK "${STELLAR_NETWORK}"`);
  }

  return Promise.resolve(Network.current().networkPassphrase());
}

export async function updateBaseReserve(): Promise<number> {
  const lastLedgerHeader = await db.ledgerHeaders.getLastLedgerHeader();
  setBaseReserve(lastLedgerHeader.baseReserve);
  return lastLedgerHeader.baseReserve;
}
