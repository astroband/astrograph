import { makeKey } from "../../util/crypto";
import { IBlank, NQuad, NQuads } from "../nquads";

export class AccountBuilder {
  public static build(id: string) {
    const builder = new AccountBuilder(id);
    return builder.build();
  }

  public static key(id: string) {
    return makeKey("account", id);
  }
  private current: IBlank;

  constructor(private id: string) {
    this.current = NQuad.blank(AccountBuilder.key(id));
  }

  public build(): NQuads {
    return [
      new NQuad(this.current, "key", NQuad.value(this.current.value)),
      new NQuad(this.current, "type", NQuad.value("account")),
      new NQuad(this.current, "deleted", NQuad.value(false)),
      new NQuad(this.current, "id", NQuad.value(this.id))
    ];
  }
}
