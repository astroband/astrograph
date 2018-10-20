import { Cursor, Worker } from "../../src/ingest";
import { SubscriptionPayloadCollection } from "../../src/ingest/subscription_payload_collection";
import { Publisher } from "../../src/pubsub";

jest.mock("../../src/ingest/subscription_payload_collection");
jest.mock("../../src/pubsub");

const mockSubscriptionPayloadCollection = {};

(SubscriptionPayloadCollection as any).mockImplementation(() => {
  return mockSubscriptionPayloadCollection;
});

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
    it("creates SubscriptionPayloadCollection", async () => {
      expect(SubscriptionPayloadCollection).toHaveBeenCalledWith(transactions);
    });

    it("calls Publisher.publish", async () => {
      expect(Publisher.publish).toHaveBeenCalledWith(header, mockSubscriptionPayloadCollection);
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
