export interface IBlank {
  type: "blank";
  value: string;
};

export interface ILink {
  type: "link";
  value: string;
};

export interface IValue {
  type: "value";
  value: string | number | boolean;
};

export type Subject = IBlank | ILink;
export type Object = IBlank | ILink | IValue;

export class NQuad {
  public subject: Subject;
  public predicate: string;
  public object: Object;

  public static blank(value: string): IBlank {
    return { type: "blank", value: value };
  }

  public static link(value: string): ILink {
    return { type: "link", value: value };
  }

  public static value(value: string | number | boolean): IValue {
    return { type: "value", value: value };
  }

  public constructor(subject: Subject, predicate: string, object: Object) {
    this.subject = subject;
    this.predicate = predicate;
    this.object = object;
  }

  public toString(): string {
    return `${this.interpolate(this.subject)} <${this.predicate}> ${this.interpolate(this.object)} .`;
  }

  private interpolate(x: IBlank | ILink | IValue): string {
    switch (x.type) {
      case "blank": return `_:${x.value}`;
      case "link": return `<${x.value}>`;
      case "value": return `"${x.value}"`;
    }
  }
}

export type NQuads = Array<NQuad>;
