import { AccountSubscriptionPayload, MutationType } from "../../../src/model";
import { AccountValuesFactory } from "../../../src/model/factories";
import stellar from "stellar-base";

jest.mock("../../../src/model/factories/account_values_factory");

const rawXDR = "AAAAAQAAAAIAAAADAAAABAAAAAAAAAAAnNaDsWrrYf58AZ/37vPsUpwk0kqEGflGNc9yFOmOyFYAAAAEqBfHnAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAABAAAABAAAAAAAAAAAnNaDsWrrYf58AZ/37vPsUpwk0kqEGflGNc9yFOmOyFYAAAAEqBfHnAAAAAMAAAABAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAABAAAAAwAAAAAAAAAEAAAAAQAAAACc1oOxauth/nwBn/fu8+xSnCTSSoQZ+UY1z3IU6Y7IVgAAAAFLSEwAAAAAAP8RoqirLHHNQiYBsPxJ/OylDilni/4gIJ9wmzoeAiE9AAAAAAAAAAB//////////wAAAAEAAAAAAAAAAAAAAAMAAAAEAAAAAAAAAACc1oOxauth/nwBn/fu8+xSnCTSSoQZ+UY1z3IU6Y7IVgAAAASoF8ecAAAAAwAAAAEAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEAAAAEAAAAAAAAAACc1oOxauth/nwBn/fu8+xSnCTSSoQZ+UY1z3IU6Y7IVgAAAASoF8ecAAAAAwAAAAEAAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAA==";
const txMeta = stellar.xdr.TransactionMeta.fromXDR(Buffer.from(rawXDR, "base64"));
const xdr = txMeta.v1().operations()[0].changes()[2].updated().data().account();

let subject: AccountSubscriptionPayload;

describe("constructor", () => {
  it("sets account id and mutation type", () => {
    subject = new AccountSubscriptionPayload(MutationType.Update, xdr);

    expect(subject.id).toBe("GCONNA5RNLVWD7T4AGP7P3XT5RJJYJGSJKCBT6KGGXHXEFHJR3EFNLTE");
    expect(subject.mutationType).toBe(MutationType.Update);
  });

  describe("mutation type is 'Remove'", () => {
    it("doesn't set values", () => {
      subject = new AccountSubscriptionPayload(MutationType.Remove, xdr);
      expect(subject.values).toBeNull()
    });
  });

  describe("mutation type is not 'Remove'", () => {
    it("build values from XDR", () => {
      subject = new AccountSubscriptionPayload(MutationType.Update, xdr);
      expect(AccountValuesFactory.fromXDR).toHaveBeenCalledWith(xdr);
    });
  });
});

describe("get accountID()", () => {
  it("returns account id", () => {
    subject = new AccountSubscriptionPayload(MutationType.Update, xdr);
    expect(subject.accountID).toBe(subject.id);
  });
});
