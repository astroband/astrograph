import { fieldsList } from "graphql-fields-list";
import { createBatchResolver as create } from "graphql-resolve-batch";
import { MutationType } from "../../model";

interface IWithPagingToken {
  paging_token: string;
}

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

export function makeConnection<T extends IWithPagingToken, R = T>(records: T[], nodeBuilder?: (r: T) => R) {
  const edges = records.map(record => {
    return {
      node: nodeBuilder ? nodeBuilder(record) : record,
      cursor: record.paging_token
    };
  });

  return {
    nodes: edges.map(edge => edge.node),
    edges,
    pageInfo: {
      startCursor: records.length !== 0 ? records[0].paging_token : null,
      endCursor: records.length !== 0 ? records[records.length - 1].paging_token : null
    }
  };
}

export function eventMatches(args: any, id: string, mutationType: MutationType): boolean {
  const idEq: boolean | null = args.idEq ? id === args.idEq : null;
  const idIn: boolean | null = args.idIn ? args.idIn.includes(id) : null;
  const mutationTypeIn: boolean | null = args.mutationTypeIn ? args.mutationTypeIn.includes(mutationType) : null;

  const conditions = [idEq, idIn, mutationTypeIn].filter(c => c !== null);

  return conditions.every(c => c === true);
}
