import { xdr as XDR } from "stellar-base";
import { Column, Entity, PrimaryColumn } from "typeorm";
import { AccountID, AssetID, IBalance } from "../../model";
import { AssetTransformer, TrustLineEntryTransformer } from "../../util/orm";

@Entity("trustlines")
/* tslint:disable */
export class TrustLine implements IBalance {
  @PrimaryColumn({ name: "accountid" })
  account: AccountID;

  @PrimaryColumn({ name: "asset", type: "text", transformer: AssetTransformer } )
  asset: AssetID;

  @Column({ name: "ledgerentry", type: "text", transformer: TrustLineEntryTransformer })
  ledgerEntry: XDR.TrustLineEntry;

  @Column({ name: "lastmodified" })
  lastModified: number;

  public static parsePagingToken(token: string) {
    const [accountId, , balance] =
      Buffer
        .from(token, "base64")
        .toString()
        .split("_");

    return { balance, account: accountId }
  }

  public get flags(): number {
    return this.ledgerEntry?.flags();
  }

  public get authorized(): boolean {
    return (this.flags & XDR.TrustLineFlags.authorizedFlag().value) > 0;
  }


  public get limit(): bigint {
    return BigInt(this.ledgerEntry?.limit().toString());
  }

  public get balance(): bigint {
    return BigInt(this.ledgerEntry?.balance().toString());
  }

  public get buyingLiabilities(): bigint {
    const ext = this.ledgerEntry?.ext().value();
    if (ext instanceof XDR.TrustLineEntryV1) {
      return BigInt(ext.liabilities().buying().toString());
    }
    return 0n;
  }

  public get sellingLiabilities(): bigint {
    const ext = this.ledgerEntry?.ext().value();
    if (ext instanceof XDR.TrustLineEntryV1) {
      return BigInt(ext.liabilities().selling().toString());
    }
    return 0n;
  }

  public get spendableBalance(): bigint {
    return this.balance - this.sellingLiabilities;
  }

  public get receivableBalance(): bigint {
    return this.limit - this.balance - this.buyingLiabilities;
  }

  public get paging_token() {
    return Buffer.from(`${this.account}_${this.asset.toString()}_${this.balance}`).toString("base64");
  }
}
