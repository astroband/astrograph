import { getRepository, In } from "typeorm";
import { Account, AccountID } from "../../../model";
import { Account as AccountEntity } from "../../../orm/entities/account";
import { createBatchResolver, idOnlyRequested } from "../util";

export const account = createBatchResolver<any, Account[]>((source: any, args: any, context: any, info: any) => {
  const ids: AccountID[] = source.map((s: any) => s[info.fieldName]);

  if (idOnlyRequested(info)) {
    return ids.map(id => (id ? { id } : null));
  }

  return getRepository(AccountEntity).find({ id: In(ids) });
});
