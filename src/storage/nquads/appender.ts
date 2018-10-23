import { Builder, Source } from "./builder";

export class Appender {
  private source: Source;
  private builder: Builder;

  constructor(source: Source, builder: Builder) {
    this.source = source;
    this.builder = builder;
  }

  public append(predicate: string, object: any): Appender {
    this.builder.append(this.source, predicate, object);
    return this;
  }
}
