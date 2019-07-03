import { expect } from "chai";
import { AccountThresholds } from "../../../src/model";
import { AccountThresholdsFactory } from "../../../src/model/factories";

describe("constructor & factory", () => {
  const cases = [
    // second element is built like this:
    // Buffer.from([0x1, 0x1, 0x0, 0x1]).toString("base64") == "AQEAAQ=="
    { binary: "0000", base64: "AAAAAA==", expected: { masterWeight: 0, low: 0, medium: 0, high: 0 } },
    { binary: "1101", base64: "AQEAAQ==", expected: { masterWeight: 1, low: 1, medium: 0, high: 1 } },
    { binary: "1111", base64: "AQEBAQ==", expected: { masterWeight: 1, low: 1, medium: 1, high: 1 } }
  ];

  cases.forEach((test) => {
    it(`correctly parses binary value ${test.binary}`, () => {
      const subject = AccountThresholdsFactory.fromValue(test.base64);

      expect(subject.masterWeight).to.equal(test.expected.masterWeight);
      expect(subject.low).to.equal(test.expected.low);
      expect(subject.medium).to.equal(test.expected.medium);
      expect(subject.high).to.equal(test.expected.high);
    });
  });
});

describe("equals()", () => {
  const thresholds = "AQEAAQ==";
  const subject = AccountThresholdsFactory.fromValue(thresholds);
  let other: AccountThresholds;

  describe("when thresholds are the same", () => {
    it("returns true", () => {
      other = AccountThresholdsFactory.fromValue(thresholds);
      expect(subject.equals(other)).to.be.true;
    });
  });

  describe("when flags are different", () => {
    it("returns false", () => {
      other = AccountThresholdsFactory.fromValue("AQAAAA==");
      expect(subject.equals(other)).to.be.false;
    });
  });
});
