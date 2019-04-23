import { Asset } from "stellar-sdk";
import { Balance } from "../../../src/model";
import { BalanceFactory } from "../../../src/model/factories";
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

let subject: Balance;

describe("constructor", () => {
  subject = BalanceFactory.fromDb(data);

  it("sets account id", () => expect(subject.account).toEqual(data.accountid));
  it("sets lastModified", () => expect(subject.lastModified).toEqual(data.lastmodified));
  it("sets limit", () => expect(subject.limit).toEqual("9223372036854775807"));
  it("sets balance", () => expect(subject.balance).toEqual("9600000000"));
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
    const fake = BalanceFactory.nativeForAccount(account);

    expect(fake).toMatchObject({
      account: account.id,
      balance: account.balance,
      limit: MAX_INT64,
      authorized: true,
      lastModified: account.lastModified
    });

    expect(fake.asset.isNative()).toBe(true);
  });
});
