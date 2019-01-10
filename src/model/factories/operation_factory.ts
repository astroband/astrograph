import { DgraphOperationsData } from "../../storage/types";
import { Operation } from "../operation";
import { DataMapper } from "./operations_data_mapper";

export class OperationFactory {
  public static fromDgraph(node: DgraphOperationsData): Operation {
    return DataMapper.call(node);
  }
}
