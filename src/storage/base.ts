import { Client as ElasticClient } from "@elastic/elasticsearch";
import * as secrets from "../util/secrets";

interface IElasticSearchHit {
  _index: string;
  _type: string;
  _id: string;
  _score: number;
  _source: any; // TODO: here should be union of all data types we return from Elastic
  _sort: Array<string | number>;
}

export abstract class BaseStorage {
  private client: ElasticClient;

  constructor() {
    this.client = new ElasticClient({ node: secrets.ELASTIC_URL });
  }

  protected abstract get elasticIndexName(): string;

  protected async search(body: any) {
    const { body: docs } = await this.client.search({
      index: this.elasticIndexName,
      body
    });

    return docs.hits.hits.map((h: IElasticSearchHit) => {
      h._source.paging_token = h._source.order.toString();
      return { ...h._source, id: h._id };
    });
  }

  protected async get(id: string) {
    const { body: doc } = await this.client.get({
      index: this.elasticIndexName,
      type: "_doc",
      id
    });

    return doc.found ? doc._source : null;
  }
}
