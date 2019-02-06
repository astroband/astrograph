import { makeKey } from "../../util/crypto";
import { publicKeyFromBuffer } from "../../util/xdr/account";
import { IBlank, NQuad, NQuads } from "../nquads";
import { Builder } from "./";

export class AccountBuilder extends Builder {
  public static fromXDR(xdr: any) {
    return new AccountBuilder(publicKeyFromBuffer(xdr.value()));
  }

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
    this.pushValues({
      "account.id": this.id,
      deleted: false
    });

    return this.nquads;
  }
}
