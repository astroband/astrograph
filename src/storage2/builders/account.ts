import { makeKey } from "../../util/crypto";
import { IBlank, NQuad, NQuads } from "../nquads";
import { Builder } from "./builder";

export class AccountBuilder extends Builder {
  public static key(id: string) {
    return makeKey("account", id);
  }
  
  public readonly current: IBlank;

  constructor(private id: string) {
    super();
    this.current = NQuad.blank(AccountBuilder.key(id));
  }

  public build(): NQuads {
    this.pushKey();
    this.pushValue("id", this.id);
    this.pushValue("type", "account");
    this.pushValue("deleted", false);

    return this.nquads;
  }
}
