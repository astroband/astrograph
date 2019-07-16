import { Network } from "stellar-base";
import { getCustomRepository } from "typeorm";
import { LedgerHeaderRepository } from "../orm/repository/ledger_header";
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
  const lastLedgerHeader = await getCustomRepository(LedgerHeaderRepository).findLast();

  if (!lastLedgerHeader) {
    throw new Error("No ledgers in the database!");
  }

  setBaseReserve(lastLedgerHeader.baseReserve);
  return lastLedgerHeader.baseReserve;
}
