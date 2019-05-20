import stellar from "stellar-base";
import { AccountValues } from "../../../src/model";
import { AccountThresholdsFactory } from "../../../src/model/factories";
import AccountValuesFactory from "../../factories/account_values";
import SignerFactory from "../../factories/signer";

let subject: AccountValues;

describe("constructor", () => {
  const signers = [SignerFactory.build(), SignerFactory.build(), SignerFactory.build()];
  const rawData = AccountValuesFactory.build({ signers });

  it("sorts passed signers list", () => {
    subject = new AccountValues(rawData);

    const assignedSigners = subject.signers.map(s => s.signer);
    expect(assignedSigners).toEqual(signers.map(s => s.signer).sort());
  });
});

describe("diffAttrs(other)", () => {
  let other: AccountValues;

  describe("when other is different account", () => {
    it("throws an error", () => {
      subject = AccountValuesFactory.build();
      other = AccountValuesFactory.build();

      expect(() => subject.diffAttrs(other)).toThrow();
    });
  });

  it("returns the names of attributes whose values differ", () => {
    const accountId = stellar.Keypair.random().publicKey();
    const subjectData = {
      id: accountId,
      balance: "19729999500",
      sequenceNumber: "12884901893",
      numSubentries: 1,
      inflationDestination: "",
      homeDomain: "",
      thresholds: AccountThresholdsFactory.fromValue("AQAAAA=="),
      lastModified: 6,
      signers: []
    };
    const otherData = {
      id: accountId,
      balance: "19729999510",
      sequenceNumber: "12884901993",
      numSubentries: 2,
      inflationDestination: "some_inflation_dest",
      homeDomain: "example.com",
      thresholds: AccountThresholdsFactory.fromValue("AQEBAQ=="),
      lastModified: 5,
      signers: [SignerFactory.build()]
    };

    subject = new AccountValues(subjectData);
    other = new AccountValues(otherData);
    expect(subject.diffAttrs(other)).toEqual([
      "balance",
      "sequenceNumber",
      "numSubentries",
      "inflationDestination",
      "homeDomain",
      "thresholds",
      "signers"
    ]);
  });
});
