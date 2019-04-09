import { Factory } from "rosie";
import stellar from "stellar-base";
import { Signer } from "../../src/model/signer";

Factory.define("signer")
  .attr("accountID", () => stellar.Keypair.random().publicKey())
  .attr("signer", () => stellar.Keypair.random().publicKey())
  .attr("weight", () => Math.floor(Math.random() * 5));

export default {
  build(overrides?: object): Signer {
    const data = Factory.attributes("signer", overrides);
    return new Signer(data);
  }
};
