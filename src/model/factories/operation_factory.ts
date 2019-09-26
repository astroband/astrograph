import { OperationData as StorageOperationData } from "../../storage/types";
import { Operation } from "../operation";
import { DataMapper as StorageDataMapper } from "./operation_data_mapper/storage";

export class OperationFactory {
  public static fromStorage(node: StorageOperationData): Operation {
    return StorageDataMapper.call(node);
  }
}
