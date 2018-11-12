import dig from "object-dig";
import { Asset } from "stellar-sdk";
import { Connection } from "../connection";
import { IAssetData } from "../types";
import { Query } from "./query";

export type IAssetsQueryResult = Asset[];

export class AssetsQuery extends Query<IAssetsQueryResult> {
  private assetCode?: string;
  private assetIssuer?: string;
  private first: number;
  private offset: number;

  constructor(connection: Connection, first: number, assetCode?: string, assetIssuer?: string, offset?: number) {
    super(connection);
    this.assetCode = assetCode;
    this.assetIssuer = assetIssuer;
    this.first = first;
    this.offset = offset || 0;
  }

  public async call(): Promise<IAssetsQueryResult> {
    const r = await this.request();
    const data = dig(r, "assets");
    if (!data) {
      return [];
    }
    return data.map(this.mapData);
  }

  protected async request(): Promise<any> {
    const filterStatements: { issuer?: string; code?: string } = {};

    if (this.assetIssuer) {
      filterStatements.issuer = `issuer @filter(eq(id, ${this.assetIssuer}))`;
    }

    if (this.assetCode) {
      filterStatements.code = `@filter(uid(A) AND eq(code, ${this.assetCode}))`;
    }

    const query = `
      query assetsList($first: int, $offset: int) {
        A as var(func: eq(type, "asset")) @cascade {
          ${filterStatements.issuer || ""}
        }

        assets(func: eq(type, "asset"), first: $first, offset: $offset)
          ${filterStatements.code ? filterStatements.code : "@filter(uid(A))"} {
          code
          native
          issuer { id }
        }
      }
    `;

    return this.connection.query(query, {
      $first: this.first.toString(),
      $offset: this.offset.toString()
    });
  }

  private mapData(dgraphData: IAssetData): Asset {
    if (dgraphData.native) {
      return Asset.native();
    }

    return new Asset(dgraphData.code, dig(dgraphData, "issuer", "0", "id"));
  }
}
