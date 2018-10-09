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

  constructor(value: string) {
    if (value === "") {
      throw new Error(`UID value can not be empty`);
    }

    this.value = `<${value}>`;
  }
}
