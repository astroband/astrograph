import stellar from "stellar-base";
import { Factory } from "rosie";
import { Account } from "../../src/model";

Factory.define("account")
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
  build(overrides?: object): Account {
    const data = Factory.attributes("account", overrides);
    return new Account(data);
  }
};
