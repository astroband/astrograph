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

