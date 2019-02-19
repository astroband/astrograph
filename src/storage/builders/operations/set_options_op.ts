import _ from "lodash";
import { AccountBuilder, SpecificOperationBuilder } from "../";
import { publicKeyFromBuffer, signerKeyFromXDR } from "../../../util/xdr";
import { NQuad, NQuads } from "../../nquads";

export class SetOptionsOpBuilder extends SpecificOperationBuilder {
  public build(): NQuads {
    super.build();

    const homeDomain = this.body.homeDomain();

    this.pushValues({
      clear_flags: this.body.clearFlags(),
      set_flags: this.body.setFlags(),
      master_weight: this.body.masterWeight(),
      home_domain: homeDomain
    });

    this.pushInflationDest();
    this.pushThresholds();
    this.pushSigner();

    this.nquads.push(new NQuad(this.sourceAccountBuilder.current, "home_domain", NQuad.value(homeDomain)));

    return this.nquads;
  }

  private pushThresholds() {
    const thresholds = {
      high: this.body.highThreshold(),
      med: this.body.medThreshold(),
      low: this.body.lowThreshold()
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
    if (!this.body.signer()) {
      return;
    }

    const signer = {
      address: signerKeyFromXDR(this.body.signer().key()),
      weight: this.body.signer().weight()
    };
    const signerNquad = NQuad.blank(`${this.current.value}_signer`);
    const signerBuilder = new AccountBuilder(signer.address);

    this.nquads.push(new NQuad(this.current, `${this.entityPrefix}.signer`, signerNquad));
    this.nquads.push(...signerBuilder.build());

    this.nquads.push(new NQuad(signerNquad, "account", signerBuilder.current));
    this.nquads.push(new NQuad(signerNquad, "weight", NQuad.value(signer.weight)));
  }

  private pushInflationDest() {
    if (!this.body.inflationDest()) {
      return;
    }

    const inflationDestination = publicKeyFromBuffer(this.body.inflationDest().value());
    const inflationDestAccountBuilder = new AccountBuilder(inflationDestination);

    this.pushBuilder(inflationDestAccountBuilder, `${this.entityPrefix}.inflation_destination`);
    this.nquads.push(
      new NQuad(this.sourceAccountBuilder.current, "account.inflation_destination", inflationDestAccountBuilder.current)
    );
  }

  protected get resultCode(): number | undefined {
    if (!this.trXDR) {
      return;
    }

    return this.trXDR.setOptionsResult().switch().value;
  }

  protected get body(): any {
    return this.bodyXDR.setOptionsOp();
  }

  private get entityPrefix() {
    return "set_options_op";
  }
}
