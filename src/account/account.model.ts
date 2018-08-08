import AccountFlags from "./account_flags.model";
import AccountThresholds from "./account_thresholds.model";

export default class Account {
  public id: string;
  public balance: number;
  public seqNumber: number;
  public numSubentries: number;
  public inflationDest: number;
  public homeDomain: number;
  public thresholds: AccountThresholds;
  public flags: AccountFlags;
  public lastModified: number;

  // trustlines: [Trustline!]!
  // data: [DataEntry!]
  // signers: [Signer!]
}

// type Account {
//   id: AccountID!
//   balance: Float!
//   sequenceNumber: Int!
//   numSubentries: Int!
//   inflationDest: AccountID
//   homeDomain: String
//   thresholds: AccountThresholds!
//   flags: AccountFlags!
//   lastModified: Int!
//   trustlines: [Trustline!]!
//   data: [DataEntry!]
//   signers: [Signer!]
// }
