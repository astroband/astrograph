export class UID {
  // Creates UID if value is present, returns null for blank value. Useful for UID.from() || UID.blank()
  public static from(value: any): UID | null {
    if (!value) {
      return null;
    }

    return new UID(value);
  }

  public readonly value: string;
  public readonly raw: string;

  constructor(value: string) {
    if ((value === "") || (value === undefined) || (value === null)) {
      throw new Error(`UID value can not be empty`);
    }

    this.raw = value;
    this.value = `<${value}>`;
  }
}
