import { BigNumber } from "bignumber.js";
export type Order = [BigNumber, BigNumber]; // amount, price
export type OrderBook = Order[];

export function buy(orderBook: OrderBook, amountToBuy: BigNumber): BigNumber {
  let amountToSell = new BigNumber(0);

  for (const [amount, price] of orderBook) {
    if (amountToBuy.gt(amount)) {
      amountToSell = amountToSell.plus(amount.times(price));
      amountToBuy = amountToBuy.minus(amount);
    } else {
      amountToSell = amountToSell.plus(amountToBuy.times(price));
      break;
    }
  }

  return amountToSell;
}

export function sell(orderBook: OrderBook, amountToSell: BigNumber): BigNumber {
  let amountToBuy = new BigNumber(0);
  for (const [amount, price] of orderBook) {
    if (amountToSell.gt(amount.times(price))) {
      amountToBuy = amountToBuy.plus(amount);
      amountToSell = amountToSell.minus(amount.times(price));
    } else {
      amountToBuy = amountToBuy.plus(amountToSell.div(price));
      break;
    }
  }

  return amountToBuy;
}
