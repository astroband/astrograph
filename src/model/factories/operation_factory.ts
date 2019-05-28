import { IOperationData as IStorageOperationData } from "../../storage/types";
import { Operation } from "../operation";
import { DataMapper as StorageDataMapper } from "./operation_data_mapper/storage";

export class OperationFactory {
  public static fromStorage(node: IStorageOperationData): Operation {
    return StorageDataMapper.call(node);
  }
}
