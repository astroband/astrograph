import { Memo, MemoText, MemoHash, MemoReturn } from "stellar-base";
import logger from "./logger";

declare module "stellar-base" {
  interface Memo {
    getPlainValue(): string | null;
  }
}

// converts Buffer and array values to strings
Memo.prototype.getPlainValue = function() {
  if (typeof this.value === "string" || this.value == null) {
    return this.value;
  }

  if (this.value instanceof Array) {
    return Buffer.from(this.value).toString("utf8");
  }

  // from here value can be only Buffer
  switch(this.type) {
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
