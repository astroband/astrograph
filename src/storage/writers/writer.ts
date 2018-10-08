import { Connection } from "../connection";

export abstract class Writer {
  protected connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public abstract async write(): Promise<string>;
  protected abstract contextQuery(): string;

  protected async queryContext(vars: any): Promise<any> {
    const queryResult = await this.connection.query(this.contextQuery(), vars);
    const result = {};

    Object.keys(queryResult).map((key: string) => {
      result[key] = queryResult[key][0];
    });

    return result;
  }

  protected newOrUID(subject: any, name: string) {
    return subject ? `<${subject.uid}>` : `_:${name}`;
  }

  protected prevNQuads(uid: string, prev: any): string {
    if (prev) {
      return `
        ${uid} <prev> <${prev.uid}> .
        <${prev.uid}> <next> ${uid} .
      `;
    }

    return "";
  }

  protected nextNQuads(uid: string, next: any): string {
    if (next) {
      return `
        <${next.uid}> <prev> ${uid} .
        ${uid} <next> <${next.uid}> .
      `;
    }

    return "";
  }
}
