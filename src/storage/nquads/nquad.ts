export interface IBlank {
  type: "blank";
  value: string;
}

export interface ILink {
  type: "link";
  value: string;
}

export interface IValue {
  type: "value";
  value: string | number | boolean;
}

export type Subj = IBlank | ILink;
export type Obj = IBlank | ILink | IValue;

export class NQuad {
  public static blank(value: string): IBlank {
    return { type: "blank", value };
  }

  public static link(value: string): ILink {
    return { type: "link", value };
  }

  public static value(value: string | number | boolean): IValue {
    return { type: "value", value };
  }

  public subject: Subj;
  public predicate: string;
  public object: Obj;

  public constructor(subject: Subj, predicate: string, object: Obj) {
    this.subject = subject;
    this.predicate = predicate;
    this.object = object;
  }

  public toString(): string {
    return `${this.interpolate(this.subject)} <${this.predicate}> ${this.interpolate(this.object)} .`;
  }

  private interpolate(x: IBlank | ILink | IValue): string {
    switch (x.type) {
      case "blank":
        return `_:${x.value}`;
      case "link":
        return `<${x.value}>`;
      case "value":
        return `"${this.escape(x.value)}"`;
    }
  }

  private escape(v: string | number | boolean): string {
    return v
      .toString()
      .replace(/\n/g, "\\n")
      .replace(/\\([\s\S])|(")/g, "\\$1$2"); // escapes all not-escaped double quotes
  }
}
