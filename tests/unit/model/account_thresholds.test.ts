import { AccountThresholds } from "../../../src/model/account_thresholds";

describe("constructor", () => {
  const cases = [
    // second element is built like this:
    // Buffer.from([0x1, 0x1, 0x0, 0x1]).toString("base64") == "AQEAAQ=="
    ["0000", "AAAAAA==", { masterWeight: 0, low: 0, medium: 0, high: 0 }],
    ["1101", "AQEAAQ==", { masterWeight: 1, low: 1, medium: 0, high: 1 }],
    ["1111", "AQEBAQ==", { masterWeight: 1, low: 1, medium: 1, high: 1 }],
  ];

  test.each(cases)("Thresholds binary value: %s", (caseName, value, result) => {
    const subject = new AccountThresholds(value);

    expect(subject.masterWeight).toEqual(result.masterWeight);
    expect(subject.low).toEqual(result.low);
    expect(subject.medium).toEqual(result.medium);
    expect(subject.high).toEqual(result.high);
  });
});

describe("equals()", () => {
  const thresholds = "AQEAAQ==";
  const subject = new AccountThresholds(thresholds);
  let other: AccountThresholds;

  describe("when thresholds are the same", () => {
    it("returns true", () => {
      other = new AccountThresholds(thresholds);
      expect(subject.equals(other)).toBe(true);
    });
  });

  describe("when flags are different", () => {
    it("returns false", () => {
      other = new AccountThresholds("AQAAAA==");
      expect(subject.equals(other)).toBe(false);
    });
  });
});
