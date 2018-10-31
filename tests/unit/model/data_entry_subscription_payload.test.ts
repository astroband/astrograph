import { DataEntrySubscriptionPayload, DataEntryValues, MutationType } from "../../../src/model";
import stellar from "stellar-base";

jest.mock("../../../src/model/data_entry_values");

describe("constructor", () => {
  const rawXDR = "AAAAAQAAAAIAAAADAAby+AAAAAAAAAAAQcBkeADpOWAUnKjkYJyCrSWixCSj+E8SBlEcDoW+dD0AAAAXSHbnnAAG8vIAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAABAAby+AAAAAAAAAAAQcBkeADpOWAUnKjkYJyCrSWixCSj+E8SBlEcDoW+dD0AAAAXSHbnnAAG8vIAAAABAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAABAAAAAwAAAAAABvL4AAAAAwAAAABBwGR4AOk5YBScqORgnIKtJaLEJKP4TxIGURwOhb50PQAAAANmb28AAAAAA2JhcgAAAAAAAAAAAAAAAAMABvL4AAAAAAAAAABBwGR4AOk5YBScqORgnIKtJaLEJKP4TxIGURwOhb50PQAAABdIduecAAby8gAAAAEAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEABvL4AAAAAAAAAABBwGR4AOk5YBScqORgnIKtJaLEJKP4TxIGURwOhb50PQAAABdIduecAAby8gAAAAEAAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAA==";
  const txMeta = stellar.xdr.TransactionMeta.fromXDR(Buffer.from(rawXDR, "base64"));
  const xdr = txMeta.v1().operations()[0].changes()[0].created().data().data();

  let subject: DataEntrySubscriptionPayload;

  it("sets account id and mutation type", () => {
    subject = new DataEntrySubscriptionPayload(MutationType.Update, xdr);

    expect(subject.accountID).toBe("GBA4AZDYADUTSYAUTSUOIYE4QKWSLIWEESR7QTYSAZIRYDUFXZ2D3RCP");
    expect(subject.mutationType).toBe(MutationType.Update);
  });

  describe("mutation type is 'Remove'", () => {
    it("doesn't set values", () => {
      subject = new DataEntrySubscriptionPayload(MutationType.Remove, xdr);
      expect(subject.values).toBeNull()
    });
  });

  describe("mutation type is not 'Remove'", () => {
    it("build values from XDR", () => {
      subject = new DataEntrySubscriptionPayload(MutationType.Update, xdr);
      expect(DataEntryValues.buildFromXDR).toHaveBeenCalledWith(xdr);
    });
  });
});
