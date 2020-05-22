import { PagingParams, parseCursorPagination, properlyOrdered } from "../util/paging";
import { connection } from "./connection";

export abstract class BaseStorage {
  protected searchParams: any;

  constructor() {
    this.searchParams = {
      query: {
        bool: {
          must: []
        }
      }
    };
  }

  public async all(pagingParams?: PagingParams) {
    if (pagingParams) {
      this.paginate(pagingParams);
    }

    const docs = await this.search(this.searchParams);

    if (!docs) {
      return [];
    }

    // reset everything
    this.searchParams = {
      query: {
        bool: {
          must: []
        }
      }
    };

    return pagingParams ? properlyOrdered(docs, pagingParams) : docs;
  }

  // Finds document by ElasticSearch id
  public async findById(id: string) {
    const { body: response } = await connection.get({
      index: this.elasticIndexName,
      id
    });

    return this.convertRawDoc(response._source);
  }

  public async one() {
    this.searchParams.size = 1;

    const docs = await this.search(this.searchParams);

    if (docs.length === 0) {
      return null;
    }

    return this.convertRawDoc(docs[0]);
  }

  protected abstract get elasticIndexName(): string;
  protected abstract convertRawDoc<T>(doc: any): unknown;

  protected async search(requestBody: any) {
    const { body: response } = await connection.search({
      index: this.elasticIndexName,
      body: requestBody
    });

    return response.hits.hits.map((h: any) => {
      return { ...h._source, id: this.hitID(h) };
    });
  }

  protected hitID(hit: any): string {
    return hit._id;
  }

  protected async aggregation(queries: any) {
    const { body: response } = await connection.search(
      {
        index: this.elasticIndexName,
        body: { aggs: queries }
      },
      { querystring: { size: 0 } }
    );

    return response.aggregations;
  }

  protected addTerm(term: any) {
    this.searchParams.query.bool.must.push({ term });
    return this;
  }

  protected addTerms(terms: any) {
    this.searchParams.query.bool.must.push({ terms });
    return this;
  }

  protected paginate(pagingParams: PagingParams) {
    const { limit, order, cursor } = parseCursorPagination(pagingParams);
    this.searchParams.sort = [{ paging_token: order }];
    this.searchParams.size = limit;

    if (cursor) {
      this.searchParams.query.bool.must.push({
        range: { paging_token: pagingParams.after ? { gt: cursor } : { lt: cursor } }
      });
    }
  }
}
