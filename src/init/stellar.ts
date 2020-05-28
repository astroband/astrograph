import { db } from "../database";
import { setBaseReserve } from "../util/base_reserve";

export async function updateBaseReserve(): Promise<number> {
  const lastLedgerHeader = await db.ledgerHeaders.getLastLedgerHeader();
  setBaseReserve(lastLedgerHeader.baseReserve);
  return lastLedgerHeader.baseReserve;
}
