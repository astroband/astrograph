import { makeKey } from "../../util/crypto";

export class AccountBuilder {
  public static key(id: string) {
    return makeKey("account", id);
  }
}
