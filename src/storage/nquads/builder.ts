import { Appender } from "./appender";
import { Plain } from "./plain";

export interface IValue {
  readonly value: string;
  readonly raw: string;
}

export class Builder {
  public nquads: string = "";

  public append(source: IValue, predicate: string, object: IValue | string | number) {
    const ival = object as IValue;
    const value = ival.value ? ival : new Plain(object.toString());
    this.nquads += `${source.value} <${predicate}> ${value.value} .\n`;
    return this;
  }

  public for(source: IValue): Appender {
    return new Appender(source, this);
  }
}
