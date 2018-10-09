import { IValue } from "./builder";

export class UID implements IValue {
  public readonly value: string;

  constructor(value: string) {
    this.value = `<${value}>`;
  }
}
