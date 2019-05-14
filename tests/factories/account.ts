import { BigNumber } from "bignumber.js";
import { Factory } from "rosie";
import stellar from "stellar-base";
import { Account } from "../../src/orm/entities";

Factory.define("account")
  .attr("id", () => stellar.Keypair.random().publicKey())
  .attr("balance", "19729999500")
  .attr("sequenceNumber", "12884901893")
  .attr("numSubentries", 1)
  .attr("inflationDest", "")
  .attr("homeDomain", "")
  .attr("thresholds", "AQAAAA==")
  .attr("flags", 0)
  .attr("lastModified", 6)
  .attr("sellingLiabilities", new BigNumber("8927364"))
  .attr("buyingLiabilities", new BigNumber("2948361"));

export default {
  build(overrides?: object): Account {
    const data = Factory.attributes("account", overrides);
    const account = new Account();
    return Object.assign(account, data);
  }
};
