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

  protected walk(data: any, fn: any): string | null {
    if (!data) {
      return null;
    }

    const { leaf, result } = fn(data);

    if (result) {
      return result;
    }

    if (leaf) {
      return this.walk(leaf, fn);
    }

    return null;
  }
}
