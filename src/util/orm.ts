import { ValueTransformer } from "typeorm";

export class Base64Transformer implements ValueTransformer {
  from (value: string): string {
    return Buffer.from(value, "base64").toString();
  }

  to (value: string): string {
    return Buffer.from(value).toString("base64");
  }
}
