export interface IAccountFlags {
  authRequired: boolean;
  authRevocable: boolean;
  authImmutable: boolean;
}

export class AccountFlags implements IAccountFlags {
  public authRequired: boolean;
  public authRevocable: boolean;
  public authImmutable: boolean;

  constructor(data: IAccountFlags) {
    this.authRequired = data.authRequired;
    this.authRevocable = data.authRevocable;
    this.authImmutable = data.authImmutable;
  }

  public equals(other: IAccountFlags): boolean {
    return (
      this.authRequired === other.authRequired &&
      this.authRevocable === other.authRevocable &&
      this.authImmutable === other.authImmutable
    );
  }
}
