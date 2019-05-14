import { ValueTransformer } from "typeorm";

export class Base64Transformer implements ValueTransformer {
  public from(value: string | null) {
    if (!value) {
      return null;
    }
    return Buffer.from(value, "base64").toString();
  }

  public to(value: string | null) {
    if (!value) {
      return null;
    }
    return Buffer.from(value).toString("base64");
  }
}
