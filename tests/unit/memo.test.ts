import "../../src/util/memo";
import { Memo } from "stellar-base";

describe("getPlainValue()", () => {
  describe("when memo is id", () => {
    it("leaves value as it is", () => {
      const memo = Memo.id("15");
      expect(memo.getPlainValue()).toBe(memo.value);
    });
  });

  describe("when memo is text", () => {
    describe("when value is string", () => {
      it("leaves value as it is", () => {
        const memo = Memo.text("abc");
        expect(memo.getPlainValue()).toBe(memo.value);
      });
    });

    describe("when value is buffer", () => {
      it("return string in utf8 encoding", () => {
        const memo = Memo.text(Buffer.from("абв", "utf8"));
        expect(memo.getPlainValue()).toBe("абв");
      });
    });

    describe("when value is array", () => {
      it("return string in utf8 encoding", () => {
        const memo = Memo.text([ 208, 191, 209, 128, 208, 184, 208, 178, 208, 181, 209, 130 ]);
        expect(memo.getPlainValue()).toBe("привет");
      });
    });
  });

  describe("when memo is hash", () => {
    it("converts value to base64", () => {
      const hashValue = "aKe+I6mN0XDAiHnzktNZ7WdSGvP4joL2yg2lpqHn8h4=";
      const memo = Memo.hash(Buffer.from(hashValue, "base64"));

      expect(memo.getPlainValue()).toBe(hashValue);
    });
  });

  describe("when memo in return", () => {
    it("converts value to base64", () => {
      const hexValue = "a5c2884587c6b058d6c33283890bf591a5c2884587c6b058d6c33283890bf591";
      const memo = Memo.return(hexValue);

      expect(memo.getPlainValue()).toBe("pcKIRYfGsFjWwzKDiQv1kaXCiEWHxrBY1sMyg4kL9ZE=");
    });
  });
});
