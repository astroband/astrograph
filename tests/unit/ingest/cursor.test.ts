import { Cursor, ICursorResult } from "../../../src/ingest/cursor";
import { db } from "../../../src/database";
import { TransactionWithXDR } from "../../../src/model";
import { LedgerHeader } from "../../../src/orm/entities";
// import { LedgerHeaderFactory } from "../../../src/model/factories";

import transactionWithXDRFactory from "../../factories/transaction_with_xdr";

let subject: Cursor;
let currentSeq: number;

// FIXME: I can't figure out, how to do proper mocking of typeorm
// methods with jest
describe.skip("nextLedger", () => {
  let nextLedger: ICursorResult | null;

  describe("when there is next ledger", () => {
    beforeEach(async () => {
      currentSeq = 11283656;
      subject = new Cursor(currentSeq);

      // db.ledgerHeaders.findBySeq = jest.fn(async () => {
      //   return LedgerHeaderFactory.fromXDR(
      //     "AAAACpu5Wy6XUCesngorpL57yoG0i0dyS/tyXW9/pOHAWB1g/vOvkuTW6sOjQ5J/UfdDxSPOdBzpQHPtxS+aqLYOVIIAAAAAW64lHQAAAAAAAAAA+mOkLoK3Qh4iYwEZhuTJ5UBcnquN2hUbRnlacVuANNfZBUZSKny+MDs/CsEOZBHJYiq2bfw3g29Zfscl1/w5rgCsLMgOeO/1wzZt/AA8ti5WjOMdAAAA3QAAAAAAC4eBAAAAZABMS0AAAAAyLJn/+RKod3TxY2ZLCmeYW+nTf5sMlH4oOTIPSbvRPWbUUe70msqPqxdC84/x0kllEumRFaF4i/sKbwptOoBKhyJ9CWKlXQXHWff9yKUlpaVJJy4TcELJV3w0nlwaNbRzLf+JwGVYb6BnB2GiZESvf1yEibvlU21ZVeEBsccbkg4AAAAA"
      //   );
      // });

      db.transactions.findAllBySeq = jest.fn(async () => {
        return [transactionWithXDRFactory.build({ ledgerSeq: currentSeq })];
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
      expect(transactions[0]).toBeInstanceOf(TransactionWithXDR);
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

      // db.ledgerHeaders.findBySeq = jest.fn(async () => null);
      // db.ledgerHeaders.findMaxSeq = jest.fn(async () => maxSeq);
    });

    it("returns null", async () => {
      nextLedger = await subject.nextLedger();
      expect(nextLedger).toBeNull();
    });

    describe("when there is gap between max seq and current seq", () => {
      beforeEach(() => {
        maxSeq = currentSeq + 20;
      });

      it("skips the gap", async () => {
        await subject.nextLedger();
        expect(subject.current).toBe(maxSeq);
      });
    });

    describe("there is no gap between max seq and current seq", () => {
      beforeEach(() => {
        maxSeq = currentSeq;
      });

      it("doesn't increment the seq", async () => {
        await subject.nextLedger();
        expect(subject.current).toBe(currentSeq);
      });
    });
  });
});
