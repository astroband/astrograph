import { Factory } from "rosie";
import stellar from "stellar-base";
import { AccountFlags, AccountThresholds, AccountValues, IAccountFlags } from "../../src/model2";

Factory.define("account_values")
  .attr("id", () => stellar.Keypair.random().publicKey())
  .attr("balance", "19729999500")
  .attr("sequenceNumber", "12884901893")
  .attr("numSubentries", 1)
  .attr("inflationDest", "")
  .attr("homeDomain", "")
  .attr("thresholds", new AccountThresholds({ masterWeight: 1, low: 1, medium: 1, high: 1 }))
  .attr("flags", new AccountFlags({ authRequired: false, authImmutable: false, authRevokable: false }))
  .attr("lastModified", 6)
  .attr("signers", []);

export default {
  build(overrides?: any): AccountValues {
    const data = Factory.attributes("account_values", overrides);
    data.signers = (overrides && overrides.signers) || [];

    return new AccountValues(data);
  },
  data(): IAccountFlags {
    return Factory.attributes("account_values", {});
  }
};
