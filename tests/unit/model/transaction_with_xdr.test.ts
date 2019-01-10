import transactionWithXDRFactory from "../../factories/transaction_with_xdr";

describe("constructor", () => {
  describe("memo parsing", () => {
    test("none", () => {
      const xdr =
        "AAAAAGL8HQvQkbK2HA3WVjRrKmjX00fG8sLI7m0ERwJW/AX3AAAAZAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAnj+71iuHPvMz3z5b4OhuBG6xCaey+w2TeGT1exLwKIsAAAACVAvkAAAAAAAAAAABVvwF9wAAAEBPmjDcP4OFniA+mYO5QeWnJrZ2OE9eqD9S2zqP4nYy7MEfj7yrp47fYZhkNjbZGlCGB1qIQAGs/BJmaYZlfsgP";
      const tx = transactionWithXDRFactory.build({ txbody: xdr });
      expect(tx.memo).toBeUndefined();
    });

    const cases = [
      [
        "text",
        "AAAAAGL8HQvQkbK2HA3WVjRrKmjX00fG8sLI7m0ERwJW/AX3AAAAZAAAAAAAAAACAAAAAAAAAAEAAAAIVGV4dE1lbW8AAAABAAAAAAAAAAEAAAAAnj+71iuHPvMz3z5b4OhuBG6xCaey+w2TeGT1exLwKIsAAAAAAAAAAlQL5AAAAAAAAAAAAVb8BfcAAABA6n883WGzzyl8NZAz5LIQUHJYBHYMdlqc18VMSt+VpOhm8Q5F61Fs2S1CjpZpNy8WtDmOOxW9gVhVFSHYj2U7DA==",
        Buffer.from("TextMemo", "utf8")
      ],
      [
        "id",
        "AAAAAGL8HQvQkbK2HA3WVjRrKmjX00fG8sLI7m0ERwJW/AX3AAAAZAAAAAAAAAADAAAAAAAAAAIAAAAAAAAADwAAAAEAAAAAAAAAAQAAAACeP7vWK4c+8zPfPlvg6G4EbrEJp7L7DZN4ZPV7EvAoiwAAAAAAAAACVAvkAAAAAAAAAAABVvwF9wAAAEAlWK1EZughrBrCrCFhD8Jiw0oI4cryFgVXKygdBRP8PXmL/S8rZCcpmH8IBCNfkOBdem+KhxvmCGJPeoY0K2wA",
        "15"
      ],
      [
        "hash",
        "AAAAAGL8HQvQkbK2HA3WVjRrKmjX00fG8sLI7m0ERwJW/AX3AAAAZAAAAAAAAAAEAAAAAAAAAANmYzNkM2VmZTk4ZTNkOGM2NDg4M2Q2NjRkNTFkZDAwMAAAAAEAAAAAAAAAAQAAAACeP7vWK4c+8zPfPlvg6G4EbrEJp7L7DZN4ZPV7EvAoiwAAAAAAAAACVAvkAAAAAAAAAAABVvwF9wAAAEB1MPAiOPE3dTXP0ph+banyxSeuaBxeJasyhXf+it7f9vnF98QAGem68Vu4X7VFM45TVPrT+ig/OVM0hQQE5AAE",
        Buffer.from("fc3d3efe98e3d8c64883d664d51dd000", "utf8")
      ],
      [
        "return",
        "AAAAAGL8HQvQkbK2HA3WVjRrKmjX00fG8sLI7m0ERwJW/AX3AAAAZAAAAAAAAAAFAAAAAAAAAARhNWMyODg0NTg3YzZiMDU4ZDZjMzMyODM4OTBiZjU5MQAAAAEAAAAAAAAAAQAAAACeP7vWK4c+8zPfPlvg6G4EbrEJp7L7DZN4ZPV7EvAoiwAAAAAAAAACVAvkAAAAAAAAAAABVvwF9wAAAEAZmHuTELrEb1UNCxOCqN7UUomYvVq4p+3qH9V/xkAV703nvSNPJyvO/g4PS32ygUUEGMToLTXaAfavY6vaOvUL",
        Buffer.from("a5c2884587c6b058d6c33283890bf591", "utf8")
      ]
    ];

    test.each(cases)("%s", (memoType, xdr, memoValue) => {
      const tx = transactionWithXDRFactory.build({ txbody: xdr });
      expect(tx.memo!.type).toBe(memoType);
      expect(tx.memo!.value).toEqual(memoValue);
    });
  });

  describe("time bounds", () => {
    const cases = [
      [
        "time bounds are not set",
        "AAAAAGL8HQvQkbK2HA3WVjRrKmjX00fG8sLI7m0ERwJW/AX3AAAAZAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAnj+71iuHPvMz3z5b4OhuBG6xCaey+w2TeGT1exLwKIsAAAACVAvkAAAAAAAAAAABVvwF9wAAAEBPmjDcP4OFniA+mYO5QeWnJrZ2OE9eqD9S2zqP4nYy7MEfj7yrp47fYZhkNjbZGlCGB1qIQAGs/BJmaYZlfsgP",
        undefined
      ],
      [
        "lower bound is set",
        "AAAAAIO+zCWkYwJVyrzlIvttbpvuU0K/mEIVPESvJKGpkfKZAAAAZAAACvYAAAACAAAAAQAAAABbtxo6AAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAKAAAABHRlc3QAAAABAAAABHRlc3QAAAAAAAAAAA==",
        [1538726458, 0]
      ],
      [
        "upper bound is set",
        "AAAAAIO+zCWkYwJVyrzlIvttbpvuU0K/mEIVPESvJKGpkfKZAAAAZAAACvYAAAACAAAAAQAAAAAAAAAAAAAAAFve8PcAAAAAAAAAAQAAAAAAAAAKAAAABHRlc3QAAAABAAAABHRlc3QAAAAAAAAAAA==",
        [0, 1541337335]
      ],
      [
        "both bounds are set",
        "AAAAAIO+zCWkYwJVyrzlIvttbpvuU0K/mEIVPESvJKGpkfKZAAAAZAAACvYAAAACAAAAAQAAAABbtxo6AAAAAFu3HiIAAAAAAAAAAQAAAAAAAAAKAAAABHRlc3QAAAABAAAABHRlc3QAAAAAAAAAAA==",
        [1538726458, 1538727458]
      ]
    ];

    test.each(cases)("%s", (caseName, xdr, value) => {
      const tx = transactionWithXDRFactory.build({ txbody: xdr });
      expect(tx.timeBounds).toEqual(value);
    });
  });

  describe("source account", () => {
    test("set from tx body", () => {
      const xdr =
        "AAAAAIO+zCWkYwJVyrzlIvttbpvuU0K/mEIVPESvJKGpkfKZAAAAZAAACvYAAAACAAAAAQAAAABbtxo6AAAAAFu3HiIAAAAAAAAAAQAAAAAAAAAKAAAABHRlc3QAAAABAAAABHRlc3QAAAAAAAAAAA==";
      const tx = transactionWithXDRFactory.build({ txbody: xdr });

      expect(tx.sourceAccount).toBe("GCB35TBFURRQEVOKXTSSF63NN2N64U2CX6MEEFJ4ISXSJINJSHZJTVBN");
    });
  });
});
