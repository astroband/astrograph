import { Memo } from "stellar-sdk";
import "../../src/util/memo";

describe("getPlainValue()", () => {
  it("leaves Id memos as they are", () => {
    const memo = Memo.id("15");
    expect(memo.getPlainValue()).toBe(memo.value);
  });

  it("handles Hash memos", () => {
    const hashValue = "aKe+I6mN0XDAiHnzktNZ7WdSGvP4joL2yg2lpqHn8h4=";
    const memo = Memo.hash(Buffer.from(hashValue, "base64").toString("hex"));

    expect(memo.getPlainValue()).toBe(hashValue);
  });

  it("handles Return memos", () => {
    const hexValue = "a5c2884587c6b058d6c33283890bf591a5c2884587c6b058d6c33283890bf591";
    const memo = Memo.return(hexValue);

    expect(memo.getPlainValue()).toBe("pcKIRYfGsFjWwzKDiQv1kaXCiEWHxrBY1sMyg4kL9ZE=");
  });
});
