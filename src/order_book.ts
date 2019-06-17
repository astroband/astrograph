import { getManager } from "typeorm";
import { AssetID } from "./model";
import { AssetTransformer } from "./util/orm";

const dbQuery = `SELECT
	*,
	(pricen :: double precision / priced :: double precision) as price

FROM
((
	-- This query returns the "asks" portion of the summary, and it is very straightforward
	SELECT
		'ask' as type,
		co.pricen,
		co.priced,
		SUM(co.amount) as amount

	FROM  offers co

	WHERE 1=1
	AND   sellingasset = $1
	AND   buyingasset = $2

	GROUP BY
		co.pricen,
		co.priced,
		co.price

	ORDER BY co.price ASC

	LIMIT $3

) UNION (
	-- This query returns the "bids" portion, inverting the where clauses
	-- and the pricen/priced.  This inversion is necessary to produce the "bid"
	-- view of a given offer (which are stored in the db as an offer to sell)
	SELECT
		'bid'  as type,
		co.priced as pricen,
		co.pricen as priced,
		SUM(co.amount) as amount

	FROM offers co

	WHERE 1=1
	AND   sellingasset = $2
	AND   buyingasset = $1

	GROUP BY
		co.pricen,
		co.priced,
		co.price

	ORDER BY co.price ASC

	LIMIT $3
)) summary

ORDER BY type, price;
`;

interface IOrderBookBid {
  type: "bid";
  price: string;
  amount: string;
}

interface IOrderBookAsk {
  type: "ask";
  price: string;
  amount: string;
}

type OrderBookItem = IOrderBookBid | IOrderBookAsk;

interface IOrderBook {
  bids: IOrderBookBid[];
  asks: IOrderBookAsk[];
}

export async function load(selling: AssetID, buying: AssetID, limit: number): Promise<IOrderBook> {
  const em = getManager();

  selling = AssetTransformer.to(selling);
  buying = AssetTransformer.to(buying);

  const results: OrderBookItem[] = await em.query(dbQuery, [selling, buying, limit]);

  return {
    bids: results.filter((r): r is IOrderBookBid => r.type === "bid"),
    asks: results.filter((r): r is IOrderBookAsk => r.type === "ask")
  };
}
