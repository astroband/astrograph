import BigNumber from "bignumber.js";

export function calculatePrice(priceN: number, priceD: number): string {
  return new BigNumber(priceN).div(priceD).toString();
}
