import { Asset } from "stellar-sdk";
import { Balance } from "../../../src/model";
import { BalanceFactory } from "../../../src/model/factories";
import { MAX_INT64 } from "../../../src/util";
import AccountFactory from "../../factories/account";

jest.mock("../../../src/util/stellar", () => {
  return {
    ...(jest.requireActual("../../../src/util/stellar")),
    getMinBalance: (numSubentries: number) => (numSubentries + 2) * 5000000
  }
})

const data = {
  accountid: "GDT3N2FHODKJ5ZJRRVEYUYQEWQ5V7T6EPG4UQXDWJXTUDTD252QXCL5K",
  assettype: 1,
  assetcode: "KHL",
  issuer: "GD7RDIVIVMWHDTKCEYA3B7CJ7TWKKDRJM6F74IBAT5YJWOQ6AIQT3SAW",
  tlimit: "9223372036854775807",
  balance: "9600000000",
  flags: 1,
  lastmodified: 6,
  buyingliabilities: "100",
  sellingliabilities: "300"
};

let subject: Balance;

describe("constructor", () => {
  subject = BalanceFactory.fromDb(data);

  it("sets account id", () => expect(subject.account).toEqual(data.accountid));
  it("sets lastModified", () => expect(subject.lastModified).toEqual(data.lastmodified));
  it("sets limit", () => expect(subject.limit.toString()).toEqual("9223372036854775807"));
  it("sets balance", () => expect(subject.balance.toString()).toEqual("9600000000"));
  it("sets authorized", () => expect(subject.authorized).toBe(true));
  it("sets asset", () => {
    expect(subject.asset).toBeInstanceOf(Asset);
    expect(subject.asset.getCode()).toEqual(data.assetcode);
    expect(subject.asset.getIssuer()).toEqual(data.issuer);
  });
  it("sets spendable balance", () => expect(subject.spendableBalance.toString()).toEqual("9599999700"));
  it("sets receivable balance", () => expect(subject.receivableBalance.toString()).toEqual("9223372027254775707"));
});

describe("static buildFakeNative(account)", () => {
  it("returns an object with the data of account's trustline on XLM", async () => {
    const account = AccountFactory.build();
    const fake = await BalanceFactory.nativeForAccount(account);

    expect(fake).toMatchObject({
      account: account.id,
      authorized: true,
      lastModified: account.lastModified
    });

    expect(fake.balance.toString()).toEqual(account.balance);
    expect(fake.limit.toString()).toEqual(MAX_INT64);
    expect(fake.spendableBalance.toString()).toEqual("19706072136");
    expect(fake.receivableBalance.toString()).toEqual("9223372017121827946");

    expect(fake.asset.isNative()).toBe(true);
  });
});
