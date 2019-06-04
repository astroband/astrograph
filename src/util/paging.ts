import { SelectQueryBuilder } from "typeorm";

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

export async function paginate(
  queryBuilder: SelectQueryBuilder<any>,
  pagingParams: PagingParams,
  cursorCols: string | string[],
  cursorParser?: (token: string) => { [name: string]: string }
) {
  return new Pager(queryBuilder, pagingParams, cursorCols, cursorParser).paginate();
}

class Pager {
  private readonly cursorCols: string[];
  private readonly cursorParameters: string[];

  constructor(
    private readonly queryBuilder: SelectQueryBuilder<any>,
    private readonly pagingParams: PagingParams,
    cursorCols: string | string[],
    private readonly cursorParser?: (token: string) => { [name: string]: string }
  ) {
    this.cursorCols = typeof cursorCols === "string" ? [cursorCols] : cursorCols;
    this.cursorCols.sort();

    // Strip tablename prefix
    this.cursorParameters = this.cursorCols.map(col => col.replace(/^\w+\./, ""));
  }

  public async paginate(): Promise<any[]> {
    const { limit, cursor, order } = parseCursorPagination(this.pagingParams);

    this.cursorCols.forEach(col => {
      this.queryBuilder.addOrderBy(col, order.toUpperCase() as "ASC" | "DESC");
    });

    this.queryBuilder.take(limit);

    if (cursor) {
      this.applyCursor(cursor);
    }

    return properlyOrdered(await this.queryBuilder.getMany(), this.pagingParams);
  }

  private applyCursor(cursor: string) {
    if (this.pagingParams.after) {
      this.queryBuilder.andWhere(this.buildWhereExpression(">"));
    } else if (this.pagingParams.before) {
      this.queryBuilder.andWhere(this.buildWhereExpression("<"));
    }

    if (!this.cursorParser) {
      this.queryBuilder.setParameter(this.cursorParameters[0], cursor);
    } else {
      const cursorVals = this.cursorParser(cursor);

      this.checkCursorParser(cursorVals);

      for (const name of this.cursorParameters) {
        this.queryBuilder.setParameter(name, cursorVals[name]);
      }
    }
  }

  private checkCursorParser(cursorVals: { [name: string]: string }): void {
    const keys = Object.keys(cursorVals).sort();

    if (JSON.stringify(keys) !== JSON.stringify(this.cursorParameters)) {
      throw new Error(`cursorParser returned unsuitable values, got [${keys}], need [${this.cursorParameters}]`);
    }
  }

  private buildWhereExpression(op: ">" | "<") {
    const columnNames = this.cursorCols.join(", ");
    const placeholders = this.cursorParameters.map(cp => `:${cp}`).join(", ");
    // (col1, col2) > (:col1, :col2)
    return `(${columnNames}) ${op} (${placeholders})`;
  }
}
