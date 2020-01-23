import { db } from "../../../src/database";
import { Cursor, Worker } from "../../../src/ingest";
import { TransactionWithXDR } from "../../../src/model";
import { Publisher } from "../../../src/pubsub";

import { LedgerHeaderFactory } from "../../../src/model/factories";
import transactionWithXDRFactory from "../../factories/transaction_with_xdr";

jest.mock("../../../src/pubsub");

const cursor = new Cursor(1);
const header = LedgerHeaderFactory.fromXDR(
  "AAAACpu5Wy6XUCesngorpL57yoG0i0dyS/tyXW9/pOHAWB1g/vOvkuTW6sOjQ5J/UfdDxSPOdBzpQHPtxS+aqLYOVIIAAAAAW64lHQAAAAAAAAAA+mOkLoK3Qh4iYwEZhuTJ5UBcnquN2hUbRnlacVuANNfZBUZSKny+MDs/CsEOZBHJYiq2bfw3g29Zfscl1/w5rgCsLMgOeO/1wzZt/AA8ti5WjOMdAAAA3QAAAAAAC4eBAAAAZABMS0AAAAAyLJn/+RKod3TxY2ZLCmeYW+nTf5sMlH4oOTIPSbvRPWbUUe70msqPqxdC84/x0kllEumRFaF4i/sKbwptOoBKhyJ9CWKlXQXHWff9yKUlpaVJJy4TcELJV3w0nlwaNbRzLf+JwGVYb6BnB2GiZESvf1yEibvlU21ZVeEBsccbkg4AAAAA"
);
const transactions: TransactionWithXDR[] = [transactionWithXDRFactory.build()];

db.transactions.findAllBySeq = jest.fn().mockResolvedValue(transactions);

const subject = new Worker(cursor);

describe("run", () => {
  describe("when there is new ledger", () => {
    beforeEach(async () => {
      cursor.nextLedger = jest.fn().mockResolvedValue(header);
      await subject.run();
    });

    it("calls Publisher.publish", async () => {
      expect(Publisher.publish).toHaveBeenCalledWith(header, transactions);
    });
  });

  describe("when there is no new ledger", () => {
    beforeEach(async () => {
      cursor.nextLedger = jest.fn(async () => null);
      (Publisher.publish as jest.Mock).mockClear();
      await subject.run();
    });

    it("doesn't publish anything", async () => {
      expect(Publisher.publish).not.toHaveBeenCalled();
    });
  });
});
