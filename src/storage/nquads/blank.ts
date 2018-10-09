export class Blank {
  public readonly value: string;

  constructor(value: string) {
    if (value === "") {
      throw new Error(`UID value can not be empty`);
    }

    this.value = `_:${value}`;
  }
}
