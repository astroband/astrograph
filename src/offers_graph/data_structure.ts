import { BigNumber } from "bignumber.js";
import { AssetID } from "../model";
import { Offer } from "../orm/entities";
import { AssetsWithBalances } from "../orm/entities/account";
import { IOrder, OrderBook } from "./orderbook";

interface IEdgeData {
  capacity: BigNumber;
  orderBook: OrderBook;
}

interface IPaths {
  [sourceAsset: string]: { amountNeeded: BigNumber; path: AssetID[] };
}

const maxPathLength = 5;

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

  public findPaths(sourceAssetsWithBalances: AssetsWithBalances, destAsset: AssetID, destAmount: BigNumber): IPaths {
    const sourceAssets = Object.keys(sourceAssetsWithBalances);

    // take a short-cut if we're trying to find a path from "native" to "native":
    if (destAsset === "native" && sourceAssets.length === 1 && sourceAssets[0] === "native") {
      return { native: { amountNeeded: destAmount, path: [] } };
    }

    // the lowest cost so far for a path going from an asset to `destAsset`
    const lowestCost = new Map<AssetID, BigNumber>();

    // the paths found for each individual source asset
    const result: IPaths = {};

    // take a short-cut if `destAssset` is one of the target assets,
    // and add a direct path already from the start
    if (sourceAssets.includes(destAsset)) {
      result[destAsset] = { amountNeeded: destAmount, path: [] };
      lowestCost.set(destAsset, destAmount);
    }

    // the current path being checked
    const path: AssetID[] = [];

    const find = (nextAsset: AssetID, amountIn: BigNumber) => {
      if (path.includes(nextAsset) || path.length - 1 > maxPathLength) {
        return;
      }

      // if we get to an a point where we've come to in a previous path
      // and that path has a lower cost than this one, then there's no point
      // in traversing any further
      const cost = lowestCost.get(nextAsset);

      if (!cost || amountIn.lt(cost)) {
        lowestCost.set(nextAsset, amountIn);
      } else {
        return;
      }

      // if the current asset is one of our source assets,
      // store away the path we've taken to get here
      if (sourceAssets.includes(nextAsset)) {
        result[nextAsset] = { amountNeeded: amountIn, path: path.slice(1).reverse() };
      }

      // fan out
      const edges = this.getEdges(nextAsset);

      if (edges.length !== 0) {
        path.push(nextAsset);

        for (const {
          vertex,
          data: { capacity, orderBook }
        } of edges) {
          if (capacity.gte(amountIn)) {
            const amountOut = orderBook.buy(amountIn);
            find(vertex, amountOut);
          }
        }

        path.pop();
      }
    };

    find(destAsset, destAmount);

    return result;
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
      console.warn("Graph seems to be inconsistent");
      return;
    }

    adjacent.splice(indexToDrop, 1);
    this.adjacencyList.set(from, adjacent);
  }

  // for debug purposes
  public get edgesCount() {
    return this.edges.size;
  }

  private sortOrderBooks() {
    this.edges.forEach((data, edge, map) => {
      data.orderBook.sort();
      map.set(edge, data);
    });
  }
}
