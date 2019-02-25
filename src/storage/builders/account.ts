import { AccountID, IAccount } from "../../model";
import { makeKey } from "../../util/crypto";
import { publicKeyFromBuffer } from "../../util/xdr/account";
import { IBlank, NQuad, NQuads } from "../nquads";
import { Builder } from "./";

export class AccountBuilder extends Builder {
  public static key(id: AccountID) {
    return makeKey("account", id);
  }

  public static keyFromXDR(xdr: any) {
    return makeKey("account", publicKeyFromBuffer(xdr.value()));
  }

  public readonly current: IBlank;

  constructor(private readonly account: IAccount) {
    super();
    this.current = NQuad.blank(AccountBuilder.key(account.id));
  }

  public build(): NQuads {
    this.pushKey();
    this.pushValues({
      "account.id": this.account.id,
      home_domain: this.account.homeDomain,
      master_weight: this.account.thresholds.masterWeight
    });
    this.pushInflationDest();
    this.pushThresholds();

    return this.nquads;
  }

  private pushThresholds(): void {
    const thresholdsNquad = NQuad.blank(`${this.current.value}_thresholds`);
    const thresholds = this.account.thresholds;

    this.nquads.push(new NQuad(this.current, "account.thresholds", thresholdsNquad));
    this.nquads.push(new NQuad(thresholdsNquad, "high", NQuad.value(thresholds.high)));
    this.nquads.push(new NQuad(thresholdsNquad, "med", NQuad.value(thresholds.medium)));
    this.nquads.push(new NQuad(thresholdsNquad, "low", NQuad.value(thresholds.low)));
  }

  private pushInflationDest(): void {
    if (!this.account.inflationDest) {
      return;
    }

    this.nquads.push(
      new NQuad(
        this.current,
        "account.inflation_destination",
        NQuad.blank(AccountBuilder.key(this.account.inflationDest))
      )
    );
  }
}
