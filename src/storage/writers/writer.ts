import { Connection } from "../connection";

export abstract class Writer {
  protected connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public abstract async write(): Promise<string>;

  protected newOrUID(subject: any, name: string) {
    return subject && (subject.uid || subject[0]) ? `<${subject.uid || subject[0].uid}>` : `_:${name}`;
  }

  protected prevNQuads(uid: string, prev: any): string {
    if (prev && (prev.uid || prev[0])) {
      const prevUID = prev.uid || prev[0].uid;

      return `
        ${uid} <prev> <${prevUID}> .
        <${prevUID}> <next> ${uid} .
      `;
    }

    return "";
  }

  protected nextNQuads(uid: string, next: any): string {
    if (next && (next.uid || next[0])) {
      const nextUID = next.uid || next[0].uid;

      return `
        <${nextUID}> <prev> ${uid} .
        ${uid} <next> <${nextUID}> .
      `;
    }

    return "";
  }
}
