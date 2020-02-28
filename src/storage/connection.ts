import { Client as ElasticClient } from "@elastic/elasticsearch";
import * as secrets from "../util/secrets";

const connection = new ElasticClient({ node: secrets.ELASTIC_URL });

export { connection }
