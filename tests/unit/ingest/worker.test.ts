import typeorm = require("typeorm");
import { db } from "../../../src/database";
import { Cursor, Worker } from "../../../src/ingest";
import { TransactionWithXDR } from "../../../src/model";
import { Publisher } from "../../../src/pubsub";

import { LedgerHeaderFactory } from "../../../src/model/factories";
import transactionWithXDRFactory from "../../factories/transaction_with_xdr";
import { LedgersStorage } from "../../../src/storage/ledgers";

jest.mock("../../../src/pubsub");

const cursor = new Cursor(1);
cursor.acknowledge = jest.fn().mockResolvedValue(undefined);
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

    it("calls Publisher.publish and acknowledges the ledger", async () => {
      expect(Publisher.publish).toHaveBeenCalledWith(header, transactions);
      expect(cursor.acknowledge).toHaveBeenCalled();
    });
  });

  it("does not advance the cursor when transaction loading fails", async () => {
    const updateCursor = jest.fn();
    typeorm.getManager = jest.fn().mockReturnValue({ query: updateCursor });
    LedgersStorage.findBySeq = jest.fn().mockResolvedValue(header);
    db.transactions.findAllBySeq = jest.fn().mockRejectedValueOnce(new Error("transaction fetch failed"));
    const failingCursor = new Cursor(header.ledgerSeq);

    await expect(new Worker(failingCursor).run()).rejects.toThrow("transaction fetch failed");
    expect(failingCursor.current).toBe(header.ledgerSeq);
    expect(updateCursor).not.toHaveBeenCalled();
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
