export interface IAccountFlags {
  authRequired: boolean;
  authRevokable: boolean;
  authImmutable: boolean;
}

export class AccountFlags implements IAccountFlags {
  public authRequired: boolean;
  public authRevokable: boolean;
  public authImmutable: boolean;

  constructor(data: IAccountFlags) {
    this.authRequired = data.authRequired;
    this.authRevokable = data.authRevokable;
    this.authImmutable = data.authImmutable;
  }

  public equals(other: IAccountFlags): boolean {
    return (
      this.authRequired === other.authRequired &&
      this.authRevokable === other.authRevokable &&
      this.authImmutable === other.authImmutable
    );
  }
}
