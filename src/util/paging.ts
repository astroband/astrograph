interface IForwardPagingParams {
  first: number;
  after: string;
}

interface IBackwardPagingParams {
  last: number;
  before: string;
}

export type PagingParams = IForwardPagingParams & IBackwardPagingParams;

export enum SortOrder {
  DESC = "DESC",
  ASC = "ASC"
}

export function invertSortOrder(order: SortOrder) {
  if (order === SortOrder.DESC) {
    return SortOrder.ASC;
  }

  return SortOrder.DESC;
}

export function parseCursorPagination(args: PagingParams) {
  const { first, after, last, before } = args;

  if (!first && !last) {
    throw new Error("Missing paging parameters");
  }

  return {
    limit: first || last,
    order: last ? SortOrder.DESC : SortOrder.ASC,
    cursor: last ? before : after
  };
}

export function properlyOrdered(records: any[], pagingParams: PagingParams): any[] {
  return pagingParams.last ? records.reverse() : records;
}
