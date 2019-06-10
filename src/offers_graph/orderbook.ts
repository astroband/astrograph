import { BigNumber } from "bignumber.js";

export interface IOrder {
  amount: BigNumber;
  price: BigNumber;
}

export class OrderBook {
  constructor(private readonly orders: IOrder[] = []) {}

  public getOrders() {
    // return copy of the orders
    return this.orders.map(o => o);
  }

  public addOrder(order: IOrder): void {
    this.orders.push(order);
  }

  public sort() {
    this.orders.sort((a, b) => a.price.comparedTo(b.price));
  }

  public buy(amountToBuy: BigNumber): BigNumber {
    let amountToSell = new BigNumber(0);

    for (const { amount, price } of this.orders) {
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
}
