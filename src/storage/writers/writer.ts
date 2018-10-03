import { Connection } from "../connection";

export abstract class Writer {
  protected connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public abstract async write(): Promise<string>;
  protected abstract prevNextCurrentQuery(): string;

  protected async prevNextCurrent(vars: any): Promise<any> {
    const result = await this.connection.query(this.prevNextCurrentQuery(), vars);
    const current = result.current[0];
    const prev = result.prev[0];
    const next = result.next[0];

    return { prev, next, current };
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
