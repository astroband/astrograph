import { IValue } from "./builder";

export class Plain implements IValue {
  public readonly value: string;
  public readonly raw: string;

  constructor(value: string) {
    this.raw = value;
    this.value = `"${value}"`;
  }
}
