import { expect } from "chai";
import sinon from "sinon";
import { Cursor, ICursorResult } from "../../../src/ingest/cursor";
import { LedgerHeader, TransactionWithXDR } from "../../../src/model";
import { LedgerHeaderFactory } from "../../../src/model/factories";

import { db } from "../../../src/database";
import transactionWithXDRFactory from "../../factories/transaction_with_xdr";

let subject: Cursor;
let currentSeq: number;

describe("nextLedger", () => {
  let nextLedger: ICursorResult | null;

  describe("when there is next ledger", () => {
    beforeEach(async () => {
      currentSeq = 11283656;
      subject = new Cursor(currentSeq);

      db.ledgerHeaders.findBySeq = sinon.fake.returns(
        LedgerHeaderFactory.fromXDR(
          "AAAACpu5Wy6XUCesngorpL57yoG0i0dyS/tyXW9/pOHAWB1g/vOvkuTW6sOjQ5J/UfdDxSPOdBzpQHPtxS+aqLYOVIIAAAAAW64lHQAAAAAAAAAA+mOkLoK3Qh4iYwEZhuTJ5UBcnquN2hUbRnlacVuANNfZBUZSKny+MDs/CsEOZBHJYiq2bfw3g29Zfscl1/w5rgCsLMgOeO/1wzZt/AA8ti5WjOMdAAAA3QAAAAAAC4eBAAAAZABMS0AAAAAyLJn/+RKod3TxY2ZLCmeYW+nTf5sMlH4oOTIPSbvRPWbUUe70msqPqxdC84/x0kllEumRFaF4i/sKbwptOoBKhyJ9CWKlXQXHWff9yKUlpaVJJy4TcELJV3w0nlwaNbRzLf+JwGVYb6BnB2GiZESvf1yEibvlU21ZVeEBsccbkg4AAAAA"
        )
      );

      db.transactions.findAllBySeq = sinon.fake.returns(
        [transactionWithXDRFactory.build({ ledgerSeq: currentSeq })]
      );

      nextLedger = await subject.nextLedger();
    });

    it("returns { header, transactions } object", async () => {
      expect(nextLedger).to.have.property("header");
      expect(nextLedger).to.have.property("transactions");
    });

    it("returns LedgerHeader instance", async () => {
      expect(nextLedger!.header).to.be.an.instanceof(LedgerHeader);
    });

    it("returns transactions list", async () => {
      const result = await subject.nextLedger();
      const transactions = result!.transactions;

      expect(transactions).to.have.lengthOf(1);
      expect(transactions[0]).to.be.an.instanceof(TransactionWithXDR);
      expect(transactions[0].ledgerSeq).to.equal(currentSeq);
    });

    it("increments sequence number", async () => {
      expect(subject.current).to.equal(currentSeq + 1);
    });
  });

  describe("when there is no next ledger", () => {
    let maxSeq: number;

    beforeEach(() => {
      currentSeq = 11283656;
      subject = new Cursor(currentSeq);
      db.ledgerHeaders.findBySeq = sinon.fake.returns(null);
    });

    describe("when there is no gap", () => {
      it("returns null", async () => {
        nextLedger = await subject.nextLedger();
        expect(nextLedger).to.be.null;
      });
    });

    describe("when there is gap between max seq and current seq", () => {
      it("skips the gap", async () => {
        maxSeq = currentSeq + 20;
        db.ledgerHeaders.findMaxSeq = sinon.fake.returns(maxSeq);

        await subject.nextLedger();

        expect(subject.current).to.equal(maxSeq);
      });
    });

    describe("there is no gap between max seq and current seq", () => {
      it("doesn't increment the seq", async () => {
        maxSeq = currentSeq;
        db.ledgerHeaders.findMaxSeq = sinon.fake.returns(maxSeq);

        await subject.nextLedger();
        expect(subject.current).to.equal(currentSeq);
      });
    });
  });
});
