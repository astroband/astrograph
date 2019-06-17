import { BigNumber } from "bignumber.js";
import { AssetID } from "../model";
import { Offer } from "../orm/entities";
import logger from "../util/logger";
import { IOrder, OrderBook } from "./orderbook";

interface IEdgeData {
  capacity: BigNumber;
  orderBook: OrderBook;
}

export class OffersGraph {
  public static build(offers: Offer[]) {
    const graph = new OffersGraph();
    graph.build(offers);

    return graph;
  }

  private readonly adjacencyList: Map<AssetID, AssetID[]>;
  private readonly edges: Map<string, IEdgeData>;

  constructor() {
    this.adjacencyList = new Map<AssetID, AssetID[]>();
    this.edges = new Map<string, IEdgeData>();
  }

  public build(offers: Offer[]) {
    for (const offer of offers) {
      const [assetToBuy, assetToSell] = [offer.buying, offer.selling];

      const edge = this.getEdgeData(assetToSell, assetToBuy);
      const order: IOrder = { amount: offer.amount, price: offer.price };

      if (!edge) {
        this.addEdge(assetToSell, assetToBuy, {
          capacity: offer.amount,
          orderBook: new OrderBook([order])
        });
      } else {
        edge.orderBook.addOrder(order);

        this.updateEdge(assetToSell, assetToBuy, {
          capacity: edge.capacity.plus(offer.amount),
          orderBook: edge.orderBook
        });
      }
    }

    this.sortOrderBooks();
  }

  public update(selling: AssetID, buying: AssetID, offers: Offer[]): void {
    if (offers.length === 0) {
      this.dropEdge(selling, buying);
      return;
    }

    let capacity = new BigNumber(0);
    const orderBook = new OrderBook();

    for (const { amount, price } of offers) {
      orderBook.addOrder({ amount, price });
      capacity = capacity.plus(amount);
    }

    this.updateEdge(selling, buying, { capacity, orderBook });
    this.sortOrderBooks();
  }

  public addEdge(from: AssetID, to: AssetID, data: IEdgeData): void {
    if (this.edges.has(`${from}->${to}`)) {
      throw new Error(`Edge between ${from} and ${to} already exists. Use \`updateEdge\` to overwrite`);
    }

    this.updateEdge(from, to, data);
  }

  public updateEdge(from: AssetID, to: AssetID, data: IEdgeData): void {
    const adjacent = this.adjacencyList.get(from);

    if (!adjacent) {
      this.adjacencyList.set(from, [to]);
    } else {
      this.adjacencyList.set(from, adjacent.concat(to));
    }

    this.edges.set(`${from}->${to}`, data);
  }

  public getEdgeData(from: AssetID, to: AssetID): IEdgeData | undefined {
    return this.edges.get(`${from}->${to}`);
  }

  public getEdges(from: AssetID): Array<{ vertex: AssetID; data: IEdgeData }> {
    const adjacent = this.adjacencyList.get(from);

    if (!adjacent) {
      return [];
    }

    return adjacent.map(to => {
      const data = this.getEdgeData(from, to);
      return { vertex: to, data: data! };
    });
  }

  public dropEdge(from: AssetID, to: AssetID): void {
    this.edges.delete(`${from}->${to}`);
    const adjacent = this.adjacencyList.get(from);

    if (!adjacent) {
      return;
    }

    const indexToDrop = adjacent.findIndex(el => el === to);

    if (indexToDrop === -1) {
      logger.warn("Graph seems to be inconsistent");
      return;
    }

    adjacent.splice(indexToDrop, 1);
    this.adjacencyList.set(from, adjacent);
  }

  private sortOrderBooks() {
    this.edges.forEach((data, edge, map) => {
      data.orderBook.sort();
      map.set(edge, data);
    });
  }
}
