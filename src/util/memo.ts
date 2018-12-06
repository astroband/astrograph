import { Memo, MemoHash, MemoReturn, MemoText } from "stellar-sdk";
import logger from "./logger";

declare module "stellar-sdk" {
  interface Memo {
    getPlainValue(): string | null;
  }
}

// converts Buffer values to strings
Memo.prototype.getPlainValue = function() {
  if (!this.value || !(this.value instanceof Buffer)) {
    return this.value;
  }

  switch (this.type) {
    case MemoText:
      return this.value.toString("utf8");
    case MemoHash:
    case MemoReturn:
      return this.value.toString("base64");
    default:
      logger.warn(`Memo with buffer value has an unexpected type ${this.type}`);
      return this.value.toString();
  }
};
