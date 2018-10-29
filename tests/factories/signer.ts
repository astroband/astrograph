import stellar from "stellar-base";
import { Factory } from "rosie";
import { Signer } from "../../src/model/signer";

Factory.define("signer")
  .attr("accountid", () => { return stellar.Keypair.random().publicKey() })
  .attr("publickey", () => { return stellar.Keypair.random().publicKey() })
  .attr("weight", () => { return Math.floor(Math.random() * 5) });

export default {
  build(overrides?: object): Signer {
    const data = Factory.attributes("signer", overrides);
    return new Signer(data);
  }
};
