import stellar from "stellar-base";
import { AccountValues } from "../../../src/model";
import AccountValuesFactory from "../../factories/account_values";
import SignerFactory from "../../factories/signer";

let subject: AccountValues;

describe("constructor", () => {
  const rawData = AccountValuesFactory.data();
  const signers = [SignerFactory.build(), SignerFactory.build(), SignerFactory.build()];

  it("sorts passed signers list", () => {
    subject = new AccountValues(rawData, signers);

    const assignedSigners = subject.signers.map(s => { return s.signer });
    expect(assignedSigners).toEqual(signers.map(s => { return s.signer }).sort());
  });
});

describe("diffAttrs(other)", () => {
  let other: AccountValues;

  describe("when other is different account", () => {
    it("throws an error", () => {
      subject = AccountValuesFactory.build();
      other = AccountValuesFactory.build();

      expect(() => { subject.diffAttrs(other) }).toThrow();
    });
  });

  it("returns the names of attributes whose values differ", () => {
    const accountId = stellar.Keypair.random().publicKey();
    const subjectData = {
      accountid: accountId,
      balance: "19729999500",
      seqnum: "12884901893",
      numsubentries: 1,
      inflationdest: "",
      homedomain: "",
      thresholds: "AQAAAA==",
      flags: 0,
      lastmodified: 6
    };
    const otherData = {
      accountid: accountId,
      balance: "19729999510",
      seqnum: "12884901993",
      numsubentries: 2,
      inflationdest: "some_inflation_dest",
      homedomain: "example.com",
      thresholds: "AQEBAQ==",
      flags: 2,
      lastmodified: 5
    };
    const signer = SignerFactory.build();

    subject = new AccountValues(subjectData, []);
    other = new AccountValues(otherData, [signer]);
    expect(subject.diffAttrs(other)).toEqual([
      "balance",
      "sequenceNumber",
      "numSubentries",
      "inflationDest",
      "homeDomain",
      "flags",
      "thresholds",
      "signers"
    ]);
  });
});
