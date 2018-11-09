import stellar from "stellar-base";
import { PaymentOperation } from "../../../src/model/payment_operation";

describe("static buildFromXDR(xdr)", () => {
  it("creates proper instance from Operation XDR", () => {
    const xdr = "AAAAAAAAAAEAAAAAnNaDsWrrYf58AZ/37vPsUpwk0kqEGflGNc9yFOmOyFYAAAAAAAAAAAjw0YA=";
    const op = PaymentOperation.buildFromXDR(stellar.xdr.Operation.fromXDR(Buffer.from(xdr, "base64")));

    expect(op.destination).toBe("GCONNA5RNLVWD7T4AGP7P3XT5RJJYJGSJKCBT6KGGXHXEFHJR3EFNLTE");
    expect(op.asset.isNative()).toBe(true);
    expect(op.amount).toBe("150000000");
    expect(op.source).toBeNull();
  });

  describe("when explicit source is set", () => {
    it("sets instance `source` attribute", () => {
      const xdr = "AAAAAQAAAADv4me5ITAkngUoGyfAZFOWUoUWuFe4w4FhlfYB0sgdGgAAAAEAAAAAJ1bDPrSjnmHov6sREgsJAf/vcCVHAQmc6r5zK1cHdh0AAAAAAAAAAACYloA=";
      const op = PaymentOperation.buildFromXDR(stellar.xdr.Operation.fromXDR(Buffer.from(xdr, "base64")));
      expect(op.source).toBe("GDX6EZ5ZEEYCJHQFFANSPQDEKOLFFBIWXBL3RQ4BMGK7MAOSZAORUSFN");
    });
  });
});
