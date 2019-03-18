import { IHorizonOperationData } from "../../datasource/types";
import { DgraphOperationsData } from "../../storage/types";
import { Operation as HorizonOperation } from "../horizon_operation";
import { Operation } from "../operation";
import { DataMapper as DgraphDataMapper } from "./operation_data_mapper/dgraph";
import { DataMapper as HorizonDataMapper } from "./operation_data_mapper/horizon";

export class OperationFactory {
  public static fromDgraph(node: DgraphOperationsData): Operation {
    return DgraphDataMapper.call(node);
  }

  public static fromHorizon(node: IHorizonOperationData): HorizonOperation {
    return HorizonDataMapper.call(node);
  }
}
