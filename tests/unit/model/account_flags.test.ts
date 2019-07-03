import { expect } from "chai";
import { AccountFlags } from "../../../src/model";
import { AccountFlagsFactory } from "../../../src/model/factories";

describe("constructor & factory", () => {
  const cases = [
    { binary: "000", int: 0, expected: { authRequired: false, authRevocable: false, authImmutable: false } },
    { binary: "001", int: 1, expected: { authRequired: true, authRevocable: false, authImmutable: false } },
    { binary: "010", int: 2, expected: { authRequired: false, authRevocable: true, authImmutable: false } },
    { binary: "011", int: 3, expected: { authRequired: true, authRevocable: true, authImmutable: false } },
    { binary: "100", int: 4, expected: { authRequired: false, authRevocable: false, authImmutable: true } },
    { binary: "101", int: 5, expected: { authRequired: true, authRevocable: false, authImmutable: true } },
    { binary: "110", int: 6, expected: { authRequired: false, authRevocable: true, authImmutable: true } },
    { binary: "111", int: 7, expected: { authRequired: true, authRevocable: true, authImmutable: true } }
  ];

  cases.forEach((test) => {
    it(`correctly parses flags binary value ${test.binary}`, () => {
      const subject = AccountFlagsFactory.fromValue(test.int);

      expect(subject.authImmutable).to.equal(test.expected.authImmutable);
      expect(subject.authRevocable).to.equal(test.expected.authRevocable);
      expect(subject.authRequired).to.equal(test.expected.authRequired);
    });
  });
});

describe("equals()", () => {
  const flagsValue = { authRequired: true, authRevocable: true, authImmutable: false };
  const subject = new AccountFlags(flagsValue);
  let other: AccountFlags;

  describe("when flags are the same", () => {
    it("returns true", () => {
      other = new AccountFlags(flagsValue);
      expect(subject.equals(other)).to.be.true;
    });
  });

  describe("when flags are different", () => {
    it("returns false", () => {
      other = new AccountFlags({ authRequired: true, authRevocable: false, authImmutable: false });
      expect(subject.equals(other)).to.be.false;
    });
  });
});
