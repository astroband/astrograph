import { Cursor, ICursorResult, Worker } from "../../../src/ingest";
import { TransactionWithXDR } from "../../../src/model";
import { LedgerHeader } from "../../../src/orm/entities";
import { Publisher } from "../../../src/pubsub";

import transactionWithXDRFactory from "../../factories/transaction_with_xdr";

jest.mock("../../../src/pubsub");

const cursor = new Cursor(1);
const header = new LedgerHeader();
const transactions: TransactionWithXDR[] = [transactionWithXDRFactory.build()];

const subject = new Worker(cursor);

describe("run", () => {
  describe("when there is new ledger", () => {
    beforeEach(async () => {
      cursor.nextLedger = jest.fn(async (): Promise<ICursorResult> => ({ header, transactions }));
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
