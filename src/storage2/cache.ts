import _ from "lodash";
import { Connection } from "../storage/connection";
import { NQuads, NQuad } from "./nquads";

const ___cache = new Map<string, string>();

// An idea is simple: every node in DGraph database has unique string key, which we use either to distinguish
// it in in-memory cache and to load uid from DGraph.
export class Cache {
  private nquads: NQuads;
  private connection: Connection;

  constructor(connection: Connection, nquads: NQuads) {
    this.nquads = nquads;
    this.connection = connection;
  }

  public async populate(): Promise<NQuads> {
    const { hits, misses } = this.hitsAndMisses();
    const found = await this.query(misses);

    return this.replace(hits, found);
  }

  private replace(hits: Map<string, string>, found: Map<string, string>): NQuads {
    return this.nquads.map((nquad: NQuad): NQuad => {
      let n = nquad;

      if (nquad.subject.type == "blank") {
        const value = nquad.subject.value;
        const replacement = hits[value] || found[value];

        if (replacement) {
          n = new NQuad(NQuad.link(replacement), n.predicate, n.object);
        }
      }

      if (nquad.object.type == "blank") {
        const value = nquad.object.value;
        const replacement = hits[value] || found[value];

        if (replacement) {
          n = new NQuad(n.subject, n.predicate, NQuad.link(replacement));
        }
      }

      return n;
    });
  }

  // Extracts all _:abcde (new nodes to be created) from the list of NQuads.
  private blanks(): string[] {
    const blanks = new Array<string>();

    // Important: nodes are extracted either from left and right side of all expressions.
    this.nquads.forEach((nquad: NQuad) => {
      if (nquad.subject.type == "blank") {
        blanks.push(nquad.subject.value);
      }

      if (nquad.object.type == "blank") {
        blanks.push(nquad.object.value);
      }
    });

    return _.uniqWith(blanks, _.isEqual);
  }

  // Splits all missing nodes in two groups: found and missing in cache
  private hitsAndMisses(): { hits: Map<string, string>, misses: string[] } {
    const hits = new Map<string, string>();
    const misses:string[] = [];

    this.blanks().forEach((value: string) => {
      const cached = ___cache.get(value);

      if (cached) {
        hits.set(value, cached)
      } else {
        misses.push(value);
      }
    });

    return { hits, misses };
  }

  // Builds and runs concurrent query for passed keys, extracts them and passes back uids found in database.
  private async query(misses: string[]) {
    let query = `query cache {`;

    misses.forEach((miss: string) => {
      query += `
        _${miss}(func: eq(key, "${miss}")) {
          uid
        }
      `;
    });

    query += "}";

    const found = new Map<string, string>();
    const result = await this.connection.query(query);

    _.keys(result).forEach((k: string) => {
      const value = result[k];

      if (value && value[0]) {
        found.set(k.slice(1, -1), value[0].uid);
      }
    });

    return found;
  }
}
