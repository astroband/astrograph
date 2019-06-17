import { BigNumber } from "bignumber.js";
import { AssetID } from "../../../src/model";
import { OffersGraph } from "../../../src/offers_graph/data_structure";
import { Offer } from "../../../src/orm/entities";

function buildOffer(data: { selling: AssetID; buying: AssetID; price: number; amount: number }) {
  const offer = new Offer();
  offer.selling = data.selling;
  offer.buying = data.buying;
  offer.price = new BigNumber(data.price);
  offer.amount = new BigNumber(data.amount);

  return offer;
}

const subject = new OffersGraph();

beforeEach(() => {
  const offers = [
    buildOffer({ selling: "LED", buying: "TSE", amount: 10, price: 0.5 }),
    buildOffer({ selling: "LED", buying: "TSE", amount: 7, price: 0.46 }),
    buildOffer({ selling: "LED", buying: "MOW", amount: 5, price: 0.9 }),

    buildOffer({ selling: "MOW", buying: "LED", amount: 8, price: 0.88 }),
    buildOffer({ selling: "MOW", buying: "KZN", amount: 8, price: 0.43 }),

    buildOffer({ selling: "KZN", buying: "MOW", amount: 10, price: 0.89 }),

    buildOffer({ selling: "SVX", buying: "KZN", amount: 4, price: 0.4 })
  ];

  subject.build(offers);
});

describe("buildFromOffers()", () => {
  it("builds graph correctly", () => {
    const ledTseData = subject.getEdgeData("LED", "TSE");

    expect(ledTseData).toBeDefined();
    expect(ledTseData!.capacity).toEqual(new BigNumber(17));
    expect(ledTseData!.orderBook.getOrders()).toEqual([
      { amount: new BigNumber(7), price: new BigNumber(0.46) },
      { amount: new BigNumber(10), price: new BigNumber(0.5) }
    ]);
  });
});

describe("findPaths()", () => {
  it("works", () => {
    const paths = subject.findPaths(["LED"], "KZN", new BigNumber(3));

    expect(paths.LED).toBeDefined();
    expect(paths.LED[0].path).toEqual(["MOW"]);
  });
});
