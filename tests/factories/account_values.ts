import stellar from "stellar-base";
import { Factory } from "rosie";
import { AccountValues, IAccountRawData } from "../../src/model";

Factory.define("account_values")
  .attr("accountid", () => { return stellar.Keypair.random().publicKey() })
  .attr("balance", "19729999500")
  .attr("seqnum", "12884901893")
  .attr("numsubentries", 1)
  .attr("inflationdest", "")
  .attr("homedomain", "")
  .attr("thresholds", "AQAAAA==")
  .attr("flags", 0)
  .attr("lastmodified", 6);

export default {
  build(overrides?: any): AccountValues {
    const data = Factory.attributes("account_values", overrides);
    return new AccountValues(data, (overrides && overrides.signers) || []);
  },
  data(): IAccountRawData {
    return Factory.attributes("account_values", {});
  }
};
