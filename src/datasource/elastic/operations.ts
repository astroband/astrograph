import { Client as ElasticClient } from "@elastic/elasticsearch";
import { parseCursorPagination } from "../../util/paging";
import * as secrets from "../../util/secrets";
import { PagingParams } from "../horizon/base";
import { RESTDataSource } from "apollo-datasource-rest";

export class ElasticOperationsDataSource extends RESTDataSource {
  private client: ElasticClient;

  constructor() {
    super();
    this.client = new ElasticClient({ node: secrets.ELASTIC_URL });
  }

  public async all(pagingParams: PagingParams) {
    const { limit, order } = parseCursorPagination(pagingParams);

    const docs = await this.client.search({
      index: "op",
      body: { sort: [ { order }], size: limit }
    });

    return docs.body.hits.hits;
  }

  public async byId(id: string) {
    return null;
  }
}
