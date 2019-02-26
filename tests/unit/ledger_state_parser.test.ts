import Long from "long";
import { ChangesExtractor, ChangeType, EntryType } from "../../src/changes_extractor";
import { LedgerStateParser } from "../../src/ledger_state_parser";
import TransactionFactory from "../factories/transaction_with_xdr";

jest.mock("../../src/changes_extractor");

function offerChangeXDRMock(id: number) {
  const offer = jest.fn();
  const offerId = jest.fn();

  offerId.mockImplementation(() => Long.fromNumber(id));
  offer.mockImplementation(() => ({ offerId }));

  return { offer };
}

describe("LedgerStateParser", () => {
  describe("deletedOfferIds getter", () => {
    it("returns ids of removed offers in given transactions set", () => {
      const changesExtractorCallMock = jest.fn();
      changesExtractorCallMock 
        .mockReturnValueOnce(
          [
            [{ type: ChangeType.Removed, entry: EntryType.Offer, data: offerChangeXDRMock(15) }],
            [{ type: ChangeType.Removed, entry: EntryType.Trustline }]
          ]
        )
        .mockReturnValueOnce(
          [
            [
              { type: ChangeType.Updated, entry: EntryType.Trustline },
              { type: ChangeType.Removed, entry: EntryType.Offer, data: offerChangeXDRMock(20) }
            ],
          ]
        );

      ChangesExtractor.call = changesExtractorCallMock ;

      const txs = [TransactionFactory.build(), TransactionFactory.build()];
      const subject = new LedgerStateParser(txs);

      subject.parse();

      expect(subject.deletedOfferIds).toEqual(["15", "20"]);
    });
  });
});
