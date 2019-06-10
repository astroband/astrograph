interface IPaths {
  [sourceAsset: string]: Array<{ amountNeeded: BigNumber; path: AssetID[] }>;
}

export class PathFinder {
  private readonly paths: IPaths = {};

  constructor(
    private readonly graph: OffersGraph,
    private readonly sourceAssets: AssetID[],
    private readonly destAsset: AssetID,
    private readonly destAmount: BigNumber
  ) {
    for (const asset of sourceAssets) {
      this.paths[asset] = [];
    }
  }

  public findPaths(): IPaths {
    // take a short-cut if we're trying to find a path from "native" to "native":
    if (destAsset === "native" && sourceAssets.length === 1 && sourceAssets[0] === "native") {
      return { native: [{ amountNeeded: destAmount, path: [] }] };
    }

    // the lowest cost so far for a path going from an asset to `destAsset`
    const lowestCost = new Map<AssetID, BigNumber>();

    // take a short-cut if `destAssset` is one of the target assets,
    // and add a direct path already from the start
    if (sourceAssets.includes(destAsset)) {
      paths[destAsset].push({ amountNeeded: destAmount, path: [] });
      lowestCost.set(destAsset, destAmount);
    }

    // the current path being checked
    const path: AssetID[] = [];

    const find = (nextAsset: AssetID, amountIn: BigNumber) => {
      if (path.includes(nextAsset)) {
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
      if (nextAsset in paths) {
        paths[nextAsset].push({ amountNeeded: amountIn, path: path.slice(1).reverse() });
      }

      // if we're at the maximum path length (`path` + `destAsset`),
      // stop searching
      if (path.length === maxPathLength) {
        return;
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

    return paths;
  }
}
