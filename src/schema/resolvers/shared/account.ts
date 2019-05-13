import { fieldsList } from "graphql-fields-list";
import { getRepository, In } from "typeorm";
import { Account, AccountID } from "../../../model";
import { Account as AccountEntity } from "../../../orm/entities/account";
import { createBatchResolver, idOnlyRequested } from "../util";

export const account = createBatchResolver<any, Account[]>((source: any, args: any, context: any, info: any) => {
  const ids: AccountID[] = source.map((s: any) => s[info.fieldName]);

  if (idOnlyRequested(info)) {
    return ids.map(id => (id ? { id } : null));
  }

  const repo = getRepository(AccountEntity);
  const requestedFields = fieldsList(info);
  const findParams = { id: In(ids), relations: ([] as string[]) };

  if (requestedFields.indexOf("data") !== -1) {
    findParams.relations.push("data");
  }

  return repo.find(findParams);
});
