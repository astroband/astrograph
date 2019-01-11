import { Asset } from "stellar-sdk";
import { TrustLine } from "../../../src/model";
import { TrustLineFactory } from "../../../src/model/factories";
import { toFloatAmountString } from "../../../src/util/stellar";
import { MAX_INT64 } from "../../../src/util";
import AccountFactory from "../../factories/account";

const data = {
  accountid: "GDT3N2FHODKJ5ZJRRVEYUYQEWQ5V7T6EPG4UQXDWJXTUDTD252QXCL5K",
  assettype: 1,
  assetcode: "KHL",
  issuer: "GD7RDIVIVMWHDTKCEYA3B7CJ7TWKKDRJM6F74IBAT5YJWOQ6AIQT3SAW",
  tlimit: "9223372036854775807",
  balance: "9600000000",
  flags: 1,
  lastmodified: 6,
  buyingliabilities: "",
  sellingliabilities: ""
};

let subject: TrustLine;

describe("constructor", () => {
  subject = TrustLineFactory.fromDb(data);

  it("sets account id", () => expect(subject.accountID).toEqual(data.accountid));
  it("sets lastModified", () => expect(subject.lastModified).toEqual(data.lastmodified));
  it("formats limit", () => expect(subject.limit).toEqual("922337203685.4775807"));
  it("formats balance", () => expect(subject.balance).toEqual("960.0000000"));
  it("sets authorized", () => expect(subject.authorized).toBe(true));
  it("sets asset", () => {
    expect(subject.asset).toBeInstanceOf(Asset);
    expect(subject.asset.getCode()).toEqual(data.assetcode);
    expect(subject.asset.getIssuer()).toEqual(data.issuer);
  });
});

describe("static buildFakeNative(account)", () => {
  it("returns an object with the data of account's trustline on XLM", () => {
    const account = AccountFactory.build();
    const fake = TrustLineFactory.nativeForAccount(account);

    expect(fake).toMatchObject({
      accountID: account.id,
      balance: toFloatAmountString(account.balance),
      limit: toFloatAmountString(MAX_INT64),
      authorized: true,
      lastModified: account.lastModified
    });

    expect(fake.asset.isNative()).toBe(true);
  });
});
