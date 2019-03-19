import { Cursor, Worker } from "../../../src/ingest";
import { Publisher } from "../../../src/pubsub";

jest.mock("../../../src/pubsub");

const cursor = new Cursor(1);
const header = { foo: 1 };
const transactions = [1, 2];

const subject = new Worker(cursor);

describe("run", () => {
  describe("when there is new ledger", () => {
    beforeEach(async () => {
      cursor.nextLedger = jest.fn(() => ({ header, transactions }));
      await subject.run();
    });

    it("calls Publisher.publish", async () => {
      expect(Publisher.publish).toHaveBeenCalledWith(header, transactions);
    });
  });

  describe("when there is no new ledger", () => {
    beforeEach(async () => {
      cursor.nextLedger = jest.fn(() => null);
      (Publisher.publish as jest.Mock).mockClear();
      await subject.run();
    });

    it("doesn't publish anything", async () => {
      expect(Publisher.publish).not.toHaveBeenCalled();
    });
  });
});
