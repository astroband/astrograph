import { fieldsList } from "graphql-fields-list";
import { createBatchResolver as create } from "graphql-resolve-batch";

export function createBatchResolver<T, R>(loadFn: any) {
  return create<T, R>(async (source: ReadonlyArray<T>, args: any, context: any, info: any) =>
    loadFn(source, args, context, info)
  );
}

export function idOnlyRequested(info: any): boolean {
  const requestedFields = fieldsList(info);

  if (requestedFields.length === 1 && requestedFields[0] === "id") {
    return true;
  }

  return false;
}