import { fieldsList } from "graphql-fields-list";
import { getRepository, In } from "typeorm";
import { AccountID } from "../../../model";
import { Account } from "../../../orm/entities";
import { createBatchResolver, idOnlyRequested } from "../util";

export const account = createBatchResolver<any, Account[]>((source: any, args: any, context: any, info: any) => {
  const ids: AccountID[] = source.map((s: any) => s[info.fieldName]);

  if (idOnlyRequested(info)) {
    return ids.map(id => (id ? { id } : null));
  }

  const requestedFields = fieldsList(info);
  const findParams = { id: In(ids), relations: [] as string[] };

  if (requestedFields.indexOf("data") !== -1) {
    findParams.relations.push("data");
  }

  return getRepository(Account).find(findParams);
});
