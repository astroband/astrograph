import { AfterLoad, ViewColumn, ViewEntity } from "typeorm";
import { AccountID, AssetID, AssetCode } from "../../model";
import { AccountFlagsFactory } from "../../model/factories";

@ViewEntity({
  name: "assets",
  expression: `
    ( SELECT (((t.assetcode)::text || '-'::text) || (t.issuer)::text) AS id,
      t.assetcode AS code,
      t.issuer,
      t.flags,
      sum(t.balance) AS "totalSupply",
      sum(t.balance) FILTER (WHERE (t.flags = 1)) AS "circulatingSupply",
      count(t.accountid) AS "holdersCount",
      count(t.accountid) FILTER (WHERE (t.flags = 0)) AS "unauthorizedHoldersCount",
      max(t.lastmodified) AS "lastActivity"
      FROM trustlines t
      GROUP BY t.issuer, t.assetcode
      ORDER BY (count(t.accountid)) DESC)
    UNION
    SELECT 'native'::text AS id,
    'XLM'::character varying AS code,
    4 AS flags,
    NULL::character varying AS issuer,
    sum(accounts.balance) AS "totalSupply",
    sum(accounts.balance) AS "circulatingSupply",
    count(*) AS "holdersCount",
    0 AS "unauthorizedHoldersCount",
    max(accounts.lastmodified) AS "lastActivity"
    FROM accounts
  `
})
/* tslint:disable */
export class Asset {
  @ViewColumn()
  id: AssetID;

  @ViewColumn()
  code: AssetCode;

  @ViewColumn()
  issuer: AccountID;

  @ViewColumn()
  totalSupply: string;

  @ViewColumn()
  circulatingSupply: string;

  @ViewColumn()
  holdersCount: number;

  @ViewColumn()
  unauthorizedHoldersCount: number;

  @ViewColumn()
  lastActivity: number;

  @ViewColumn()
  flags: number;

  public get paging_token() {
    return this.id;
  }

  public get authRequired() {
    return this._authRequired;
  }

  public get authRevocable() {
    return this._authRevocable;
  }

  public get authImmutable() {
    return this._authImmutable;
  }

  private _authRequired: boolean;
  private _authRevocable: boolean;
  private _authImmutable: boolean;

  @AfterLoad()
  parseFlags() {
    const parsedFlags = AccountFlagsFactory.fromValue(this.flags);
    this._authRequired = parsedFlags.authRequired;
    this._authRevocable = parsedFlags.authRevocable;
    this._authImmutable = parsedFlags.authImmutable;
  }
}
