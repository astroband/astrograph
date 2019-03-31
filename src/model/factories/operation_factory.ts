import { IHorizonOperationData } from "../../datasource/types";
import { Operation } from "../operation";
import { DataMapper as HorizonDataMapper } from "./operation_data_mapper/horizon";

export class OperationFactory {
  public static fromHorizon(node: IHorizonOperationData): Operation {
    return HorizonDataMapper.call(node);
  }
}
