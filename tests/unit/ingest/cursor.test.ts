import typeorm = require("typeorm");
import { Cursor } from "../../../src/ingest/cursor";
import { LedgerHeader } from "../../../src/model";
import { LedgerHeaderFactory } from "../../../src/model/factories";
import { LedgersStorage } from "../../../src/storage/ledgers";

let subject: Cursor;
let currentSeq: number;

typeorm.getManager = jest.fn().mockReturnValue({
  query: jest.fn()
});

describe("nextLedger", () => {
  let nextLedger: LedgerHeader | null;

  describe("when there is next ledger", () => {
    beforeEach(async () => {
      currentSeq = 11283656;
      subject = new Cursor(currentSeq);

      LedgersStorage.findBySeq = jest.fn(async () => {
        return LedgerHeaderFactory.fromXDR(
          "AAAACpu5Wy6XUCesngorpL57yoG0i0dyS/tyXW9/pOHAWB1g/vOvkuTW6sOjQ5J/UfdDxSPOdBzpQHPtxS+aqLYOVIIAAAAAW64lHQAAAAAAAAAA+mOkLoK3Qh4iYwEZhuTJ5UBcnquN2hUbRnlacVuANNfZBUZSKny+MDs/CsEOZBHJYiq2bfw3g29Zfscl1/w5rgCsLMgOeO/1wzZt/AA8ti5WjOMdAAAA3QAAAAAAC4eBAAAAZABMS0AAAAAyLJn/+RKod3TxY2ZLCmeYW+nTf5sMlH4oOTIPSbvRPWbUUe70msqPqxdC84/x0kllEumRFaF4i/sKbwptOoBKhyJ9CWKlXQXHWff9yKUlpaVJJy4TcELJV3w0nlwaNbRzLf+JwGVYb6BnB2GiZESvf1yEibvlU21ZVeEBsccbkg4AAAAA"
        );
      });

      nextLedger = await subject.nextLedger();
    });

    it("returns LedgerHeader instance", async () => {
      expect(nextLedger).toBeInstanceOf(LedgerHeader);
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

      LedgersStorage.findBySeq = jest.fn(async () => null);
      LedgersStorage.maxSeq = jest.fn(async () => maxSeq);
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
