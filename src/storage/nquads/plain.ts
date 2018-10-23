export class Plain {
  public readonly value: string;

  constructor(value: string) {
    this.value = `"${value}"`;
  }
}
