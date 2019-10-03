import { BigNumber } from "bignumber.js";
import { AssetID } from "../../../../src/model";
import { Offer } from "../../../../src/orm/entities";
import { buildOffersGraph, findPaymentPaths } from "../../../../src/service/dex";
import { OffersGraph } from "../../../../src/service/dex/offers_graph";

function buildOffer(data: {
  selling: AssetID;
  buying: AssetID;
  priceN: number;
  priceD: number;
  price: number;
  amount: number;
}) {
  const offer = new Offer();
  offer.selling = data.selling;
  offer.buying = data.buying;
  offer.priceN = data.priceN;
  offer.priceD = data.priceD;
  offer.price = new BigNumber(data.price);
  offer.amount = new BigNumber(data.amount);

  return offer;
}

const subject = new OffersGraph();

beforeEach(() => {
  const offers = [
    buildOffer({ selling: "LED", buying: "TSE", amount: 10, priceN: 1, priceD: 2, price: 0.5 }),
    buildOffer({ selling: "LED", buying: "TSE", amount: 7, priceN: 23, priceD: 50, price: 0.46 }),
    buildOffer({ selling: "LED", buying: "MOW", amount: 5, priceN: 9, priceD: 10, price: 0.9 }),

    buildOffer({ selling: "MOW", buying: "LED", amount: 8, priceN: 22, priceD: 25, price: 0.88 }),
    buildOffer({ selling: "MOW", buying: "KZN", amount: 8, priceN: 43, priceD: 100, price: 0.43 }),

    buildOffer({ selling: "KZN", buying: "MOW", amount: 10, priceN: 89, priceD: 100, price: 0.89 }),

    buildOffer({ selling: "SVX", buying: "KZN", amount: 4, priceN: 2, priceD: 5, price: 0.4 })
  ];

  subject.build(offers);
  buildOffersGraph(offers);
});

describe("buildFromOffers()", () => {
  it("builds graph correctly", () => {
    const ledTseData = subject.getEdgeData("LED", "TSE");

    expect(ledTseData).toBeDefined();
    expect(ledTseData!.capacity).toEqual(new BigNumber(17));
    expect(ledTseData!.orderBook.getOrders()).toEqual([
      { amount: new BigNumber(7), priceN: 23, priceD: 50, price: new BigNumber(0.46) },
      { amount: new BigNumber(10), priceN: 1, priceD: 2, price: new BigNumber(0.5) }
    ]);
  });
});

describe("findPaymentPaths()", () => {
  it("works", () => {
    const paths = findPaymentPaths(["LED"], "KZN", new BigNumber(3));

    expect(paths.LED).toBeDefined();
    expect(paths.LED.path).toEqual(["MOW"]);
  });
});
