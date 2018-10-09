import { IValue } from "./builder";

export class Blank implements IValue {
  public readonly value: string;

  constructor(value: string) {
    this.value = `_:${value}`;
  }
}
