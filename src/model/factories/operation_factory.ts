import { IHorizonOperationData } from "../../datasource/types";
import { IOperationData as IStorageOperationData } from "../../storage/types";
import { Operation } from "../operation";
import { DataMapper as HorizonDataMapper } from "./operation_data_mapper/horizon";
import { DataMapper as StorageDataMapper } from "./operation_data_mapper/storage";

export class OperationFactory {
  public static fromHorizon(node: IHorizonOperationData): Operation {
    return HorizonDataMapper.call(node);
  }

  public static fromStorage(node: IStorageOperationData): Operation {
    return StorageDataMapper.call(node);
  }
}
