import { IValue } from "./builder";

export class Blank implements IValue {
  public readonly value: string;

  constructor(value: string) {
    if (value === "") {
      throw new Error(`UID value can not be empty`);
    }
    
    this.value = `_:${value}`;
  }
}
