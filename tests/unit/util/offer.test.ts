import { expect } from "chai";
import { calculateOfferPrice } from "../../../src/util/offer";

describe("calculateOfferPrice", () => {
  it("returns priceN/priceD as BigNumber", () => {
    const actual = calculateOfferPrice(1535053, 10000000);
    expect(actual).to.equal("0.1535053");
  });
});
