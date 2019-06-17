export type SignerType = "ed25519" | "preAuthTx" | "hashX";

export interface ISigner {
  signer: string;
  weight: number;
  type: SignerType;
}

export class Signer implements ISigner {
  public static sortArray(signers: Signer[]): Signer[] {
    return signers.sort((s1, s2) => {
      if (s1.signer < s2.signer) {
        return -1;
      } else if (s1.signer === s2.signer) {
        return 0;
      } else {
        return 1;
      }
    });
  }

  public readonly signer: string;
  public readonly weight: number;
  public readonly type: SignerType;

  constructor(data: ISigner) {
    this.signer = data.signer;
    this.weight = data.weight;
    this.type = data.type;
  }
}
