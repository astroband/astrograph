import _ from "lodash";
import { AccountBuilder, SpecificOperationBuilder } from "../";
import { publicKeyFromBuffer, signerKeyFromXDR } from "../../../util/xdr";
import { NQuad, NQuads } from "../../nquads";

export class SetOptionsOpBuilder extends SpecificOperationBuilder {
  public build(): NQuads {
    super.build();

    this.pushValues({
      clear_flags: this.xdr.clearFlags(),
      set_flags: this.xdr.setFlags(),
      master_weight: this.xdr.masterWeight()
    });

    this.pushInflationDest();
    this.pushThresholds();
    this.pushSigner();

    this.pushValue("home_domain", this.xdr.homeDomain());

    return this.nquads;
  }

  private pushThresholds() {
    const thresholds = {
      high: this.xdr.highThreshold(),
      med: this.xdr.medThreshold(),
      low: this.xdr.lowThreshold()
    };

    if (
      !_
        .chain(thresholds)
        .values()
        .some()
        .value()
    ) {
      return;
    }

    const thresholdsNquad = NQuad.blank(`${this.current.value}_thresholds`);

    this.nquads.push(new NQuad(this.current, "thresholds", thresholdsNquad));

    for (const key in thresholds) {
      if (_.isUndefined(thresholds[key])) {
        continue;
      }

      this.nquads.push(new NQuad(thresholdsNquad, key, NQuad.value(thresholds[key])));
    }
  }

  private pushSigner() {
    if (!this.xdr.signer()) {
      return;
    }

    const signer = {
      address: signerKeyFromXDR(this.xdr.signer().key()),
      weight: this.xdr.signer().weight()
    };
    const signerNquad = NQuad.blank(`${this.current.value}_signer`);
    const signerBuilder = new AccountBuilder(signer.address);

    this.nquads.push(new NQuad(this.current, `${this.entityPrefix}.signer`, signerNquad));
    this.nquads.push(...signerBuilder.build());

    this.nquads.push(new NQuad(signerNquad, "account", signerBuilder.current));
    this.nquads.push(new NQuad(signerNquad, "weight", NQuad.value(signer.weight)));
  }

  private pushInflationDest() {
    if (!this.xdr.inflationDest()) {
      return;
    }

    const inflationDestination = publicKeyFromBuffer(this.xdr.inflationDest().value());
    this.pushBuilder(new AccountBuilder(inflationDestination), `${this.entityPrefix}.inflation_destination`);
  }

  protected get resultCode() {
    if (!this.trXDR) {
      return;
    }

    return this.trXDR.setOptionsResult().switch().value;
  }

  private get entityPrefix() {
    return "set_options_op";
  }
}
