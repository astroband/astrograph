import { Client as ElasticClient } from "@elastic/elasticsearch";
import * as secrets from "../util/secrets";

export abstract class BaseStorage {
  private client: ElasticClient;

  constructor() {
    this.client = new ElasticClient({ node: secrets.ELASTIC_URL });
  }

  protected abstract get elasticIndexName(): string;

  protected async search(requestBody: any) {
    const { body: response } = await this.client.search({
      index: this.elasticIndexName,
      body: requestBody
    });

    return response.hits.hits.map((h: any) => {
      h._source.paging_token = h._source.order.toString();
      return { ...h._source, id: h._id };
    });
  }

  protected async get(id: string) {
    return this.client
      .get({ index: this.elasticIndexName, id })
      .then(({ body }: { body: any }) => {
        return { ...body._source, id: body._id }
      });
  }
}
