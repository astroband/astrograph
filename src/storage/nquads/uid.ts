import { IValue } from "./builder";

export class UID implements IValue {
  public static from(value: any): UID | null {
    if (!value || (!value[0] && !value.uid)) {
      return null;
    }

    const uid = value[0].uid || value.uid;

    return new UID(uid || value);
  }

  public readonly value: string;
  public readonly raw: string;

  constructor(value: string) {
    if (value === "") {
      throw new Error(`UID value can not be empty`);
    }

    this.raw = value;
    this.value = `<${value}>`;
  }
}
