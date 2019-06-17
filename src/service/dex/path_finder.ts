import { BigNumber } from "bignumber.js";
import { AssetID } from "../../model";
import { OffersGraph } from "./offers_graph";

interface IPaths {
  [sourceAsset: string]: { amountNeeded: BigNumber; path: AssetID[] };
}

const maxPathLength = 5;

export class PathFinder {
  private readonly result: IPaths = {};

  constructor(private readonly graph: OffersGraph) {}

  public findPaths(sourceAssets: AssetID[], destAsset: AssetID, destAmount: BigNumber): IPaths {
    // take a short-cut if we're trying to find a path from "native" to "native":
    if (destAsset === "native" && sourceAssets.length === 1 && sourceAssets[0] === "native") {
      return { native: { amountNeeded: destAmount, path: [] } };
    }

    // the lowest cost so far for a path going from an asset to `destAsset`
    const lowestCost = new Map<AssetID, BigNumber>();

    // take a short-cut if `destAssset` is one of the target assets,
    // and add a direct path already from the start
    if (sourceAssets.includes(destAsset)) {
      this.result[destAsset] = { amountNeeded: destAmount, path: [] };
      lowestCost.set(destAsset, destAmount);
    }

    const find = (nextAsset: AssetID, amountIn: BigNumber, currentPath: AssetID[] = []) => {
      if (currentPath.includes(nextAsset) || currentPath.length - 1 > maxPathLength) {
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
        this.result[nextAsset] = { amountNeeded: amountIn, path: currentPath.slice(1).reverse() };
      }

      // fan out
      const edges = this.graph.getEdges(nextAsset);

      if (!edges) {
        return;
      }

      for (const {
        vertex,
        data: { capacity, orderBook }
      } of edges) {
        if (capacity.gte(amountIn)) {
          const amountOut = orderBook.buy(amountIn);
          find(vertex, amountOut, currentPath.concat(nextAsset));
        }
      }
    };

    find(destAsset, destAmount);

    return this.result;
  }
}
