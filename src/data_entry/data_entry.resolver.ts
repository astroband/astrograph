import db from "../database";

const dataEntryResolver = {
  Query: {
    dataEntry(root: any, args: any, ctx: any, info: any) {
      return db.data_entries.findAllByAccountID(args.id);
    }
  }
};

export { dataEntryResolver };
