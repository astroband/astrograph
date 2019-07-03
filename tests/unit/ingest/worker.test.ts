import { expect } from "chai";
import sinon from "sinon";
import { Cursor, Worker } from "../../../src/ingest";
import { LedgerHeader, TransactionWithXDR } from "../../../src/model";
import { Publisher } from "../../../src/pubsub";

import { LedgerHeaderFactory } from "../../../src/model/factories";
import transactionWithXDRFactory from "../../factories/transaction_with_xdr";

const cursor = new Cursor(1);
const header: LedgerHeader = LedgerHeaderFactory.fromXDR(
  "AAAACpu5Wy6XUCesngorpL57yoG0i0dyS/tyXW9/pOHAWB1g/vOvkuTW6sOjQ5J/UfdDxSPOdBzpQHPtxS+aqLYOVIIAAAAAW64lHQAAAAAAAAAA+mOkLoK3Qh4iYwEZhuTJ5UBcnquN2hUbRnlacVuANNfZBUZSKny+MDs/CsEOZBHJYiq2bfw3g29Zfscl1/w5rgCsLMgOeO/1wzZt/AA8ti5WjOMdAAAA3QAAAAAAC4eBAAAAZABMS0AAAAAyLJn/+RKod3TxY2ZLCmeYW+nTf5sMlH4oOTIPSbvRPWbUUe70msqPqxdC84/x0kllEumRFaF4i/sKbwptOoBKhyJ9CWKlXQXHWff9yKUlpaVJJy4TcELJV3w0nlwaNbRzLf+JwGVYb6BnB2GiZESvf1yEibvlU21ZVeEBsccbkg4AAAAA"
);
const transactions: TransactionWithXDR[] = [transactionWithXDRFactory.build()];

const subject = new Worker(cursor);

describe("run", () => {
  beforeEach(() => {
    Publisher.publish = sinon.fake();
  });

  describe("when there is new ledger", () => {
    it("calls Publisher.publish", async () => {
      cursor.nextLedger = sinon.fake.resolves({ header, transactions });

      await subject.run();

      expect(Publisher.publish).to.have.been.calledWith(header, transactions);
    });
  });

  describe("when there is no new ledger", () => {
    it("doesn't publish anything", async () => {
      cursor.nextLedger = sinon.fake.returns(null);

      await subject.run();

      expect(Publisher.publish).to.not.have.been.called;
    });
  });
});
