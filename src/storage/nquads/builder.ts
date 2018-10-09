import { Appender } from "./appender";
import { Blank } from "./blank";
import { Plain } from "./plain";
import { UID } from "./uid";

export type Source = UID | Blank;
export type Value = UID | Plain;

export class Builder {
  public nquads: string = "";

  public append(source: Source, predicate: string, object: Value | string | number) {
    const ival = object as Value;
    const value = ival.value ? ival : new Plain(object.toString());
    this.nquads += `${source.value} <${predicate}> ${value.value} .\n`;
    return this;
  }

  public for(source: Value): Appender {
    return new Appender(source, this);
  }
}
