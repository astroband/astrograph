CREATE VIEW assets AS
( SELECT (((t.assetcode)::text || '-'::text) || (t.issuer)::text) AS id,
  t.assetcode AS code,
  t.issuer,
  a.flags,
  sum(t.balance) AS "totalSupply",
  sum(t.balance) FILTER (WHERE (t.flags = 1)) AS "circulatingSupply",
  count(t.accountid) AS "holdersCount",
  count(t.accountid) FILTER (WHERE (t.flags = 0)) AS "unauthorizedHoldersCount",
  max(t.lastmodified) AS "lastActivity"
  FROM trustlines t JOIN accounts a ON t.issuer::text = a.accountid::text
  GROUP BY t.issuer, t.assetcode, t.flags, a.flags
  ORDER BY (count(t.accountid)) DESC)
UNION
SELECT 'native'::text AS id,
'XLM'::character varying AS code,
NULL::character varying AS issuer,
4::integer AS flags,
sum(accounts.balance) AS "totalSupply",
sum(accounts.balance) AS "circulatingSupply",
count(*) AS "holdersCount",
0 AS "unauthorizedHoldersCount",
max(accounts.lastmodified) AS "lastActivity"
FROM accounts;
