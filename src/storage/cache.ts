import _ from "lodash";
import { Connection } from "../storage/connection";
import { ILink, NQuad, NQuads } from "./nquads";

const CACHE = new Map<string, string>();

// An idea is simple: every node in DGraph database has unique string key, which we use either to distinguish
// it in in-memory cache and to load uid from DGraph.
export class Cache {
  constructor(private connection: Connection, private nquads: NQuads) {}

  public async populate(): Promise<NQuads> {
    const { hits, misses } = this.hitsAndMisses();
    const found = await this.query(misses);
    return this.update(hits, found);
  }

  // Updates cache with values returned after insert
  public put(results: any) {
    results.getUidsMap().forEach((v: string, k: string) => {
      CACHE.set(k, v);
    });
  }

  // Replaces _:abcd values cached or stored in database with actual UIDs
  private update(hits: Map<string, string>, found: Map<string, string>): NQuads {
    return this.nquads.map(
      (nquad: NQuad): NQuad => {
        let newSubject: ILink | null = null;
        let newObject: ILink | null = null;

        if (nquad.subject.type === "blank") {
          const value = nquad.subject.value;
          const link = hits.get(value) || found.get(value);

          if (link) {
            newSubject = NQuad.link(link);
          }
        }

        if (nquad.object.type === "blank") {
          const value = nquad.object.value;
          const link = hits.get(value) || found.get(value);

          if (link) {
            newObject = NQuad.link(link);
          }
        }

        if (newObject || newSubject) {
          return new NQuad(newSubject || nquad.subject, nquad.predicate, newObject || nquad.object);
        }

        return nquad;
      }
    ) as NQuads;
  }

  // Extracts all _:abcde (new nodes to be created) from the list of NQuads.
  private blanks(): string[] {
    const blanks = new Array<string>();

    // Important: nodes are extracted either from left and right side of all expressions.
    this.nquads.forEach((nquad: NQuad) => {
      if (nquad.subject.type === "blank") {
        blanks.push(nquad.subject.value);
      }

      if (nquad.object.type === "blank") {
        blanks.push(nquad.object.value);
      }
    });

    return _.uniqWith(blanks, _.isEqual);
  }

  // Splits all missing nodes in two groups: found and missing in cache
  private hitsAndMisses(): { hits: Map<string, string>; misses: string[] } {
    const hits = new Map<string, string>();
    const misses: string[] = [];

    this.blanks().forEach((value: string) => {
      const cached = CACHE.get(value);

      if (cached) {
        hits.set(value, cached);
      } else {
        misses.push(value);
      }
    });

    return { hits, misses };
  }

  // Builds and runs concurrent query for passed keys, extracts them and passes back uids found in database.
  private async query(misses: string[]) {
    const found = new Map<string, string>();

    if (misses.length === 0) {
      return found;
    }

    let query = `query cache {`;

    misses.forEach((miss: string) => {
      query += `
        _${miss}(func: eq(key, "${miss}"), first: 1) {
          uid
        }
      `;
    });

    query += "}";

    const result = await this.connection.query(query);

    _.keys(result).forEach((k: string) => {
      const value = result[k];

      if (value && value[0]) {
        const uid = value[0].uid;
        const key = k.slice(1);

        found.set(key, uid);
        CACHE.set(key, uid); // Save found to cache immediately
      }
    });

    return found;
  }
}
