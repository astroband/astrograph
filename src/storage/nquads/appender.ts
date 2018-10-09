import { Builder, IValue } from "./builder";

export class Appender {
  private source: IValue;
  private builder: Builder;

  constructor(source: IValue, builder: Builder) {
    this.source = source;
    this.builder = builder;
  }

  public append(predicate: string, object: any): Appender {
    this.builder.append(this.source, predicate, object);
    return this;
  }
}
