import { expect } from "chai";
import transactionWithXDRFactory from "../../factories/transaction_with_xdr";

describe("constructor", () => {
  describe("memo parsing", () => {
    it("none", () => {
      const xdr =
        "AAAAAGL8HQvQkbK2HA3WVjRrKmjX00fG8sLI7m0ERwJW/AX3AAAAZAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAnj+71iuHPvMz3z5b4OhuBG6xCaey+w2TeGT1exLwKIsAAAACVAvkAAAAAAAAAAABVvwF9wAAAEBPmjDcP4OFniA+mYO5QeWnJrZ2OE9eqD9S2zqP4nYy7MEfj7yrp47fYZhkNjbZGlCGB1qIQAGs/BJmaYZlfsgP";
      const tx = transactionWithXDRFactory.build({ txbody: xdr });
      expect(tx.memo).to.be.undefined;
    });

    const cases = [
      {
        memoType: "text",
        xdr: "AAAAAGL8HQvQkbK2HA3WVjRrKmjX00fG8sLI7m0ERwJW/AX3AAAAZAAAAAAAAAACAAAAAAAAAAEAAAAIVGV4dE1lbW8AAAABAAAAAAAAAAEAAAAAnj+71iuHPvMz3z5b4OhuBG6xCaey+w2TeGT1exLwKIsAAAAAAAAAAlQL5AAAAAAAAAAAAVb8BfcAAABA6n883WGzzyl8NZAz5LIQUHJYBHYMdlqc18VMSt+VpOhm8Q5F61Fs2S1CjpZpNy8WtDmOOxW9gVhVFSHYj2U7DA==",
        memoValue: Buffer.from("TextMemo", "utf8")
      },
      {
        memoType: "id",
        xdr: "AAAAAGL8HQvQkbK2HA3WVjRrKmjX00fG8sLI7m0ERwJW/AX3AAAAZAAAAAAAAAADAAAAAAAAAAIAAAAAAAAADwAAAAEAAAAAAAAAAQAAAACeP7vWK4c+8zPfPlvg6G4EbrEJp7L7DZN4ZPV7EvAoiwAAAAAAAAACVAvkAAAAAAAAAAABVvwF9wAAAEAlWK1EZughrBrCrCFhD8Jiw0oI4cryFgVXKygdBRP8PXmL/S8rZCcpmH8IBCNfkOBdem+KhxvmCGJPeoY0K2wA",
        memoValue: "15"
      },
      {
        memoType: "hash",
        xdr: "AAAAAGL8HQvQkbK2HA3WVjRrKmjX00fG8sLI7m0ERwJW/AX3AAAAZAAAAAAAAAAEAAAAAAAAAANmYzNkM2VmZTk4ZTNkOGM2NDg4M2Q2NjRkNTFkZDAwMAAAAAEAAAAAAAAAAQAAAACeP7vWK4c+8zPfPlvg6G4EbrEJp7L7DZN4ZPV7EvAoiwAAAAAAAAACVAvkAAAAAAAAAAABVvwF9wAAAEB1MPAiOPE3dTXP0ph+banyxSeuaBxeJasyhXf+it7f9vnF98QAGem68Vu4X7VFM45TVPrT+ig/OVM0hQQE5AAE",
        memoValue: Buffer.from("fc3d3efe98e3d8c64883d664d51dd000", "utf8")
      },
      {
        memoType: "return",
        xdr: "AAAAAGL8HQvQkbK2HA3WVjRrKmjX00fG8sLI7m0ERwJW/AX3AAAAZAAAAAAAAAAFAAAAAAAAAARhNWMyODg0NTg3YzZiMDU4ZDZjMzMyODM4OTBiZjU5MQAAAAEAAAAAAAAAAQAAAACeP7vWK4c+8zPfPlvg6G4EbrEJp7L7DZN4ZPV7EvAoiwAAAAAAAAACVAvkAAAAAAAAAAABVvwF9wAAAEAZmHuTELrEb1UNCxOCqN7UUomYvVq4p+3qH9V/xkAV703nvSNPJyvO/g4PS32ygUUEGMToLTXaAfavY6vaOvUL",
        memoValue: Buffer.from("a5c2884587c6b058d6c33283890bf591", "utf8")
      }
    ];

    cases.forEach((test) => {
      it(`correctly build memo of type "${test.memoType}"`, () => {
        const tx = transactionWithXDRFactory.build({ txbody: test.xdr });
        expect(tx.memo!.type).to.equal(test.memoType);
        expect(tx.memo!.value).to.deep.equal(test.memoValue);
      });
    });
  });

  describe("time bounds", () => {
    const cases = [
      {
        name: "time bounds are not set",
        xdr: "AAAAAGL8HQvQkbK2HA3WVjRrKmjX00fG8sLI7m0ERwJW/AX3AAAAZAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAnj+71iuHPvMz3z5b4OhuBG6xCaey+w2TeGT1exLwKIsAAAACVAvkAAAAAAAAAAABVvwF9wAAAEBPmjDcP4OFniA+mYO5QeWnJrZ2OE9eqD9S2zqP4nYy7MEfj7yrp47fYZhkNjbZGlCGB1qIQAGs/BJmaYZlfsgP",
        expected: undefined
      },
      {
        name: "lower bound is set",
        xdr: "AAAAAIO+zCWkYwJVyrzlIvttbpvuU0K/mEIVPESvJKGpkfKZAAAAZAAACvYAAAACAAAAAQAAAABbtxo6AAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAKAAAABHRlc3QAAAABAAAABHRlc3QAAAAAAAAAAA==",
        expected: { minTime: new Date(1538726458000) }
      },
      {
        name: "upper bound is set",
        xdr: "AAAAAIO+zCWkYwJVyrzlIvttbpvuU0K/mEIVPESvJKGpkfKZAAAAZAAACvYAAAACAAAAAQAAAAAAAAAAAAAAAFve8PcAAAAAAAAAAQAAAAAAAAAKAAAABHRlc3QAAAABAAAABHRlc3QAAAAAAAAAAA==",
        expected: { minTime: new Date(0), maxTime: new Date(1541337335000) }
      },
      {
        name: "both bounds are set",
        xdr: "AAAAAIO+zCWkYwJVyrzlIvttbpvuU0K/mEIVPESvJKGpkfKZAAAAZAAACvYAAAACAAAAAQAAAABbtxo6AAAAAFu3HiIAAAAAAAAAAQAAAAAAAAAKAAAABHRlc3QAAAABAAAABHRlc3QAAAAAAAAAAA==",
        expected: { minTime: new Date(1538726458000), maxTime: new Date(1538727458000) }
      }
    ];

    cases.forEach((test) => {
      it(`correctly works, when ${test.name}`, () => {
        const tx = transactionWithXDRFactory.build({ txbody: test.xdr });
        expect(tx.timeBounds).to.deep.equal(test.expected);
      });
    });
  });

  describe("source account", () => {
    it("set from tx body", () => {
      const xdr =
        "AAAAAIO+zCWkYwJVyrzlIvttbpvuU0K/mEIVPESvJKGpkfKZAAAAZAAACvYAAAACAAAAAQAAAABbtxo6AAAAAFu3HiIAAAAAAAAAAQAAAAAAAAAKAAAABHRlc3QAAAABAAAABHRlc3QAAAAAAAAAAA==";
      const tx = transactionWithXDRFactory.build({ txbody: xdr });

      expect(tx.sourceAccount).to.equal("GCB35TBFURRQEVOKXTSSF63NN2N64U2CX6MEEFJ4ISXSJINJSHZJTVBN");
    });
  });
});
