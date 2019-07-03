import { expect } from "chai";
import { ImportMock } from "ts-mock-imports";
import { Balance } from "../../../src/model";
import { BalanceFactory } from "../../../src/model/factories";
import { MAX_INT64 } from "../../../src/util";
import * as baseReserve from "../../../src/util/base_reserve";
import AccountFactory from "../../factories/account";

ImportMock.mockFunction(baseReserve, "getReservedBalance", 3 * 5000000);

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

  it("sets account id", () => expect(subject.account).to.equal(data.accountid));
  it("sets lastModified", () => expect(subject.lastModified).to.equal(data.lastmodified));
  it("sets limit", () => expect(subject.limit.toString()).to.equal("9223372036854775807"));
  it("sets balance", () => expect(subject.balance.toString()).to.equal("9600000000"));
  it("sets authorized", () => expect(subject.authorized).to.be.true);
  it("sets asset", () => expect(subject.asset).to.equal(`${data.assetcode}-${data.issuer}`));
  it("sets spendable balance", () => expect(subject.spendableBalance.toString()).to.equal("9599999700"));
  it("sets receivable balance", () => expect(subject.receivableBalance.toString()).to.equal("9223372027254775707"));
});

describe("static buildFakeNative(account)", () => {
  it("returns an object with the data of account's trustline on XLM", async () => {
    const account = AccountFactory.build();
    const fake = await BalanceFactory.nativeForAccount(account);

    expect(fake).to.include({
      account: account.id,
      authorized: true,
      lastModified: account.lastModified
    });

    expect(fake.balance.toString()).to.equal(account.balance);
    expect(fake.limit.toString()).to.equal(MAX_INT64);
    expect(fake.spendableBalance.toString()).to.equal("19706072136");
    expect(fake.receivableBalance.toString()).to.equal("9223372017121827946");

    expect(fake.asset).to.equal("native");
  });
});
