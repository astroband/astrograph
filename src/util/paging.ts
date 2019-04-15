import { PagingParams } from "../datasource/horizon/base";

export enum SortOrder {
  DESC = "desc",
  ASC = "asc"
}

export function invertSortOrder(order: SortOrder) {
  if (order === SortOrder.DESC) {
    return SortOrder.ASC;
  }

  return SortOrder.DESC;
}

export function parseCursorPagination(args: PagingParams) {
  const { first, after, last, before, order = SortOrder.DESC } = args;

  if (!first && !last) {
    throw new Error("Missing paging parameters");
  }

  return {
    limit: first || last,
    order: last ? invertSortOrder(order) : order,
    cursor: last ? before : after
  };
}

export function properlyOrdered(records: any[], pagingParams: PagingParams): any[] {
  return pagingParams.last ? records.reverse() : records;
}
