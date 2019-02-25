import BigNumber from "bignumber.js";

export function calculateOfferPrice(priceN: number, priceD: number): string {
  return new BigNumber(priceN).div(priceD).toString();
}
