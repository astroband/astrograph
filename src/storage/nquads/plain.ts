import { IValue } from "./builder";

export class Plain implements IValue {
  public readonly value: string;

  constructor(value: string) {
    this.value = `"${value}"`;
  }
}
