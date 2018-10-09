import { Plain } from "./plain";

export interface IValue {
  readonly value: string;
}

export class Builder {
  public nquads: string = "";

  public append(source: IValue, predicate: string, object: IValue | string) {
    const value = typeof object === "string" ? new Plain(object as string) : object;
    this.nquads += `${source.value} <${predicate}> ${value.value} .\n`;
  }
}
