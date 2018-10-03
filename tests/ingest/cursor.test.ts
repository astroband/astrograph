import { Cursor, ICursorResult } from "../../src/ingest/cursor";
import { Transaction } from "../../src/model";

import db from "../../src/database";
import transactionFactory from "../factories/transaction";

import { LedgerHeader } from "../../src/model";

let subject: Cursor;
let currentSeq: number;

describe("nextLedger", () => {
  let nextLedger: ICursorResult | null;

  describe("when there is next ledger", () => {
    beforeEach(async () => {
      currentSeq = 11283656;
      subject = new Cursor(currentSeq);

      db.ledgerHeaders.findBySeq = jest.fn(() => {
        return new LedgerHeader({
          data: "AAAACpu5Wy6XUCesngorpL57yoG0i0dyS/tyXW9/pOHAWB1g/vOvkuTW6sOjQ5J/UfdDxSPOdBzpQHPtxS+aqLYOVIIAAAAAW64lHQAAAAAAAAAA+mOkLoK3Qh4iYwEZhuTJ5UBcnquN2hUbRnlacVuANNfZBUZSKny+MDs/CsEOZBHJYiq2bfw3g29Zfscl1/w5rgCsLMgOeO/1wzZt/AA8ti5WjOMdAAAA3QAAAAAAC4eBAAAAZABMS0AAAAAyLJn/+RKod3TxY2ZLCmeYW+nTf5sMlH4oOTIPSbvRPWbUUe70msqPqxdC84/x0kllEumRFaF4i/sKbwptOoBKhyJ9CWKlXQXHWff9yKUlpaVJJy4TcELJV3w0nlwaNbRzLf+JwGVYb6BnB2GiZESvf1yEibvlU21ZVeEBsccbkg4AAAAA",
        })
      });

      db.transactions.findAllBySeq = jest.fn(() => {
        return [ transactionFactory.build({ ledgerSeq: currentSeq }) ];
      });

      nextLedger = await subject.nextLedger();
    });

    it("returns { header, transactions } object", async () => {
      expect(nextLedger).toHaveProperty("header");
      expect(nextLedger).toHaveProperty("transactions");
    });

    it("returns LedgerHeader instance", async () => {
      expect(nextLedger!.header).toBeInstanceOf(LedgerHeader);
    });

    it("returns transactions list", async () => {
      const result = await subject.nextLedger();
      const transactions = result!.transactions;

      expect(transactions).toHaveLength(1);
      expect(transactions[0]).toBeInstanceOf(Transaction);
      expect(transactions[0].ledgerSeq).toBe(currentSeq);
    });

    it("increments sequence number", async () => {
      expect(subject.current).toBe(currentSeq + 1);
    });
  });

  describe("when there is no next ledger", () => {
    let maxSeq: number;

    beforeEach(async () => {
      currentSeq = 11283656;

      subject = new Cursor(currentSeq);

      db.ledgerHeaders.findBySeq = jest.fn(() => { return null; });
      db.ledgerHeaders.findMaxSeq = jest.fn(() => { return maxSeq; });
    });

    it("returns null", async () => {
      nextLedger = await subject.nextLedger();
      expect(nextLedger).toBeNull()
    });

    describe("when there is gap between max seq and current seq", () => {
      beforeEach(() => { maxSeq = currentSeq + 20 });

      it("skips the gap", async () => {
        await subject.nextLedger();
        expect(subject.current).toBe(maxSeq);
      });
    });

    describe("there is no gap between max seq and current seq", () => {
      beforeEach(() => { maxSeq = currentSeq });

      it("doesn't increment the seq", async () => {
        await subject.nextLedger();
        expect(subject.current).toBe(currentSeq);
      });
    });
  });
});
