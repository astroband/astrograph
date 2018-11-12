import _ from "lodash";
import { IBlank, ILink, NQuads, NQuad } from "./nquads";

type LinkMap = Map<IBlank, ILink | null>;

export class Cache {
  private nquads: NQuads;

  constructor(nquads: NQuads) {
    this.nquads = nquads;
  }

// : NQuads
  public populate() {
    const hits = this.hits();
    const misses = this.misses(hits);

  }

  // Extracts all _:abcde (new nodes to be created) from the list of NQuads.
  private blanks(): Array<IBlank> {
    const blanks = new Array<IBlank>();

    // Important: nodes are extracted either from left and right side of all expressions.
    this.nquads.forEach((nquad: NQuad) => {
      if (nquad.subject.type == "blank") {
        blanks.push(nquad.subject);
      }

      if (nquad.object.type == "blank") {
        blanks.push(nquad.object);
      }
    });

    return _.uniqWith(blanks, _.isEqual);
  }

  // Replaces all extracted nodes with cache hits and nulls for nodes to load from database later.
  private hits(): LinkMap {
    const hits = new Map<IBlank, ILink | null>();

    this.blanks().forEach((value: IBlank) => {
      hits.set(value, null);
    });

    return hits;
  }

  // Extracts values of all cache missed nodes
  private misses(hits: LinkMap): string[] {
    const miss = new Array<string>();

    hits.forEach((v: ILink | null, k: IBlank) => {
      if (v === null) {
        miss.push(k.value);
      }
    });

    return miss;
  }
}
