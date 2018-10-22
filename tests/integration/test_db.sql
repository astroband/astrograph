--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.9
-- Dumped by pg_dump version 9.6.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

DROP INDEX IF EXISTS public.upgradehistbyseq;
DROP INDEX IF EXISTS public.signersaccount;
DROP INDEX IF EXISTS public.sellingissuerindex;
DROP INDEX IF EXISTS public.scpquorumsbyseq;
DROP INDEX IF EXISTS public.scpenvsbyseq;
DROP INDEX IF EXISTS public.priceindex;
DROP INDEX IF EXISTS public.ledgersbyseq;
DROP INDEX IF EXISTS public.histfeebyseq;
DROP INDEX IF EXISTS public.histbyseq;
DROP INDEX IF EXISTS public.buyingissuerindex;
DROP INDEX IF EXISTS public.accountbalances;
ALTER TABLE IF EXISTS ONLY public.upgradehistory DROP CONSTRAINT IF EXISTS upgradehistory_pkey;
ALTER TABLE IF EXISTS ONLY public.txhistory DROP CONSTRAINT IF EXISTS txhistory_pkey;
ALTER TABLE IF EXISTS ONLY public.txfeehistory DROP CONSTRAINT IF EXISTS txfeehistory_pkey;
ALTER TABLE IF EXISTS ONLY public.trustlines DROP CONSTRAINT IF EXISTS trustlines_pkey;
ALTER TABLE IF EXISTS ONLY public.storestate DROP CONSTRAINT IF EXISTS storestate_pkey;
ALTER TABLE IF EXISTS ONLY public.signers DROP CONSTRAINT IF EXISTS signers_pkey;
ALTER TABLE IF EXISTS ONLY public.scpquorums DROP CONSTRAINT IF EXISTS scpquorums_pkey;
ALTER TABLE IF EXISTS ONLY public.pubsub DROP CONSTRAINT IF EXISTS pubsub_pkey;
ALTER TABLE IF EXISTS ONLY public.publishqueue DROP CONSTRAINT IF EXISTS publishqueue_pkey;
ALTER TABLE IF EXISTS ONLY public.peers DROP CONSTRAINT IF EXISTS peers_pkey;
ALTER TABLE IF EXISTS ONLY public.offers DROP CONSTRAINT IF EXISTS offers_pkey;
ALTER TABLE IF EXISTS ONLY public.ledgerheaders DROP CONSTRAINT IF EXISTS ledgerheaders_pkey;
ALTER TABLE IF EXISTS ONLY public.ledgerheaders DROP CONSTRAINT IF EXISTS ledgerheaders_ledgerseq_key;
ALTER TABLE IF EXISTS ONLY public.ban DROP CONSTRAINT IF EXISTS ban_pkey;
ALTER TABLE IF EXISTS ONLY public.accounts DROP CONSTRAINT IF EXISTS accounts_pkey;
ALTER TABLE IF EXISTS ONLY public.accountdata DROP CONSTRAINT IF EXISTS accountdata_pkey;
DROP TABLE IF EXISTS public.upgradehistory;
DROP TABLE IF EXISTS public.txhistory;
DROP TABLE IF EXISTS public.txfeehistory;
DROP TABLE IF EXISTS public.trustlines;
DROP TABLE IF EXISTS public.storestate;
DROP TABLE IF EXISTS public.signers;
DROP TABLE IF EXISTS public.scpquorums;
DROP TABLE IF EXISTS public.scphistory;
DROP TABLE IF EXISTS public.pubsub;
DROP TABLE IF EXISTS public.publishqueue;
DROP TABLE IF EXISTS public.peers;
DROP TABLE IF EXISTS public.offers;
DROP TABLE IF EXISTS public.ledgerheaders;
DROP TABLE IF EXISTS public.ban;
DROP TABLE IF EXISTS public.accounts;
DROP TABLE IF EXISTS public.accountdata;
DROP EXTENSION IF EXISTS plpgsql;
DROP SCHEMA IF EXISTS public;
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: accountdata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accountdata (
    accountid character varying(56) NOT NULL,
    dataname character varying(64) NOT NULL,
    datavalue character varying(112) NOT NULL,
    lastmodified integer DEFAULT 0 NOT NULL
);


--
-- Name: accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accounts (
    accountid character varying(56) NOT NULL,
    balance bigint NOT NULL,
    seqnum bigint NOT NULL,
    numsubentries integer NOT NULL,
    inflationdest character varying(56),
    homedomain character varying(32) NOT NULL,
    thresholds text NOT NULL,
    flags integer NOT NULL,
    lastmodified integer NOT NULL,
    buyingliabilities bigint,
    sellingliabilities bigint,
    CONSTRAINT accounts_balance_check CHECK ((balance >= 0)),
    CONSTRAINT accounts_buyingliabilities_check CHECK ((buyingliabilities >= 0)),
    CONSTRAINT accounts_numsubentries_check CHECK ((numsubentries >= 0)),
    CONSTRAINT accounts_sellingliabilities_check CHECK ((sellingliabilities >= 0))
);


--
-- Name: ban; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ban (
    nodeid character(56) NOT NULL
);


--
-- Name: ledgerheaders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ledgerheaders (
    ledgerhash character(64) NOT NULL,
    prevhash character(64) NOT NULL,
    bucketlisthash character(64) NOT NULL,
    ledgerseq integer,
    closetime bigint NOT NULL,
    data text NOT NULL,
    CONSTRAINT ledgerheaders_closetime_check CHECK ((closetime >= 0)),
    CONSTRAINT ledgerheaders_ledgerseq_check CHECK ((ledgerseq >= 0))
);


--
-- Name: offers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.offers (
    sellerid character varying(56) NOT NULL,
    offerid bigint NOT NULL,
    sellingassettype integer NOT NULL,
    sellingassetcode character varying(12),
    sellingissuer character varying(56),
    buyingassettype integer NOT NULL,
    buyingassetcode character varying(12),
    buyingissuer character varying(56),
    amount bigint NOT NULL,
    pricen integer NOT NULL,
    priced integer NOT NULL,
    price double precision NOT NULL,
    flags integer NOT NULL,
    lastmodified integer NOT NULL,
    CONSTRAINT offers_amount_check CHECK ((amount >= 0)),
    CONSTRAINT offers_offerid_check CHECK ((offerid >= 0))
);


--
-- Name: peers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.peers (
    ip character varying(15) NOT NULL,
    port integer DEFAULT 0 NOT NULL,
    nextattempt timestamp without time zone NOT NULL,
    numfailures integer DEFAULT 0 NOT NULL,
    flags integer DEFAULT 0 NOT NULL,
    CONSTRAINT peers_numfailures_check CHECK ((numfailures >= 0)),
    CONSTRAINT peers_port_check CHECK (((port > 0) AND (port <= 65535)))
);


--
-- Name: publishqueue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.publishqueue (
    ledger integer NOT NULL,
    state text
);


--
-- Name: pubsub; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pubsub (
    resid character(32) NOT NULL,
    lastread integer
);


--
-- Name: scphistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scphistory (
    nodeid character(56) NOT NULL,
    ledgerseq integer NOT NULL,
    envelope text NOT NULL,
    CONSTRAINT scphistory_ledgerseq_check CHECK ((ledgerseq >= 0))
);


--
-- Name: scpquorums; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scpquorums (
    qsethash character(64) NOT NULL,
    lastledgerseq integer NOT NULL,
    qset text NOT NULL,
    CONSTRAINT scpquorums_lastledgerseq_check CHECK ((lastledgerseq >= 0))
);


--
-- Name: signers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.signers (
    accountid character varying(56) NOT NULL,
    publickey character varying(56) NOT NULL,
    weight integer NOT NULL
);


--
-- Name: storestate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.storestate (
    statename character(32) NOT NULL,
    state text
);


--
-- Name: trustlines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trustlines (
    accountid character varying(56) NOT NULL,
    assettype integer NOT NULL,
    issuer character varying(56) NOT NULL,
    assetcode character varying(12) NOT NULL,
    tlimit bigint NOT NULL,
    balance bigint NOT NULL,
    flags integer NOT NULL,
    lastmodified integer NOT NULL,
    buyingliabilities bigint,
    sellingliabilities bigint,
    CONSTRAINT trustlines_balance_check CHECK ((balance >= 0)),
    CONSTRAINT trustlines_buyingliabilities_check CHECK ((buyingliabilities >= 0)),
    CONSTRAINT trustlines_sellingliabilities_check CHECK ((sellingliabilities >= 0)),
    CONSTRAINT trustlines_tlimit_check CHECK ((tlimit > 0))
);


--
-- Name: txfeehistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.txfeehistory (
    txid character(64) NOT NULL,
    ledgerseq integer NOT NULL,
    txindex integer NOT NULL,
    txchanges text NOT NULL,
    CONSTRAINT txfeehistory_ledgerseq_check CHECK ((ledgerseq >= 0))
);


--
-- Name: txhistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.txhistory (
    txid character(64) NOT NULL,
    ledgerseq integer NOT NULL,
    txindex integer NOT NULL,
    txbody text NOT NULL,
    txresult text NOT NULL,
    txmeta text NOT NULL,
    CONSTRAINT txhistory_ledgerseq_check CHECK ((ledgerseq >= 0))
);


--
-- Name: upgradehistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.upgradehistory (
    ledgerseq integer NOT NULL,
    upgradeindex integer NOT NULL,
    upgrade text NOT NULL,
    changes text NOT NULL,
    CONSTRAINT upgradehistory_ledgerseq_check CHECK ((ledgerseq >= 0))
);


--
-- Data for Name: accountdata; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.accountdata VALUES ('GCVIRZIN4CGYY56CSL7RYAFHKQTGE34GIASZ2D4IGZGV3FDL622LPQZT', 'test_data', 'dGVzdF92YWx1ZQ==', 4);


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.accounts VALUES ('GBTVGCI5OYBGDMCNKYFVSETXK6TTOQ4DRJBAC5K2PUUNSVB24PPSQ26Q', 10000000000, 8589934592, 0, NULL, '', 'AQAAAA==', 0, 2, NULL, NULL);
INSERT INTO public.accounts VALUES ('GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H', 999999959999999600, 4, 0, NULL, '', 'AQAAAA==', 0, 2, NULL, NULL);
INSERT INTO public.accounts VALUES ('GDQWLXN6B7IVBJ2Z2DB2VAEHYEJT4POZBB5DVPL2GWJ67YRSYPLTZ6WC', 9999999900, 8589934593, 1, NULL, '', 'AQAAAA==', 0, 3, NULL, NULL);
INSERT INTO public.accounts VALUES ('GCY7C4WARB7NIABS3JRKK54A5NQSIVF4L5CIWIBPB6GKFOSESRLZVNMZ', 9999999900, 8589934593, 1, NULL, '', 'AQAAAA==', 0, 3, NULL, NULL);
INSERT INTO public.accounts VALUES ('GCVIRZIN4CGYY56CSL7RYAFHKQTGE34GIASZ2D4IGZGV3FDL622LPQZT', 9999999900, 8589934593, 1, NULL, '', 'AQAAAA==', 0, 4, NULL, NULL);


--
-- Data for Name: ban; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: ledgerheaders; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.ledgerheaders VALUES ('63d98f536ee68d1b27b5b89f23af5311b7569a24faf1403ad0b52b633b07be99', '0000000000000000000000000000000000000000000000000000000000000000', '572a2e32ff248a07b0e70fd1f6d318c1facd20b6cc08c33d5775259868125a16', 1, 0, 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABXKi4y/ySKB7DnD9H20xjB+s0gtswIwz1XdSWYaBJaFgAAAAEN4Lazp2QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZAX14QAAAABkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
INSERT INTO public.ledgerheaders VALUES ('564f13f11b354c55be8c84bd5520c745cd6472bb6a4ed224eba4646faf12a4f4', '63d98f536ee68d1b27b5b89f23af5311b7569a24faf1403ad0b52b633b07be99', '8646c7231c878bc770300c1ba5af4f52c43b6956453cb17d53450cc0b7b081c8', 2, 1538142762, 'AAAACmPZj1Nu5o0bJ7W4nyOvUxG3Vpok+vFAOtC1K2M7B76Z6ncT4HcPGyQz1f+yERxTOPhVOTC/nyiF0diQ/7xuz18AAAAAW64yKgAAAAIAAAAIAAAAAQAAAAoAAAAIAAAAAwAAJxAAAAAAc8/NjBwF+qQVB/2llzB2fBzuAqp9gXhlPmjFw7kwsN6GRscjHIeLx3AwDBulr09SxDtpVkU8sX1TRQzAt7CByAAAAAIN4Lazp2QAAAAAAAAAAAGQAAAAAAAAAAAAAAAAAAAAZAX14QAAACcQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
INSERT INTO public.ledgerheaders VALUES ('d279d98759e1dc15a2d41270fc8002a4f425d113b8e63b6ce941e72788de3d97', '564f13f11b354c55be8c84bd5520c745cd6472bb6a4ed224eba4646faf12a4f4', 'e6c74e41149f7b83109389a52be53b99bde3eb7b8b7a847c1c62cd10fd8db4e1', 3, 1538142763, 'AAAAClZPE/EbNUxVvoyEvVUgx0XNZHK7ak7SJOukZG+vEqT0nirxrU8ET1zYDehB0P+znDoFJEAFAEZYF363l52nSz0AAAAAW64yKwAAAAAAAAAASRBtht4qOQAJcqaVqUpYJzsL77s/2Aw2gg7mDSqJYCXmx05BFJ97gxCTiaUr5TuZvePre4t6hHwcYs0Q/Y204QAAAAMN4Lazp2QAAAAAAAAAAAJYAAAAAAAAAAAAAAAAAAAAZAX14QAAACcQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
INSERT INTO public.ledgerheaders VALUES ('d4ad6f562ffb0ccccee85a10f0da3c350ba3f300a23b1e13e54b4bdfae7ae61f', 'd279d98759e1dc15a2d41270fc8002a4f425d113b8e63b6ce941e72788de3d97', 'a60447c6ad9e2ce5e528d1c6703ce26b110e170fe9545018cab82d68030ccff1', 4, 1538142764, 'AAAACtJ52YdZ4dwVotQScPyAAqT0JdETuOY7bOlB5yeI3j2XbfmLFkML0bnopfyhJ7pKU+AHIbntLnXX4bUNjWKn2UEAAAAAW64yLAAAAAAAAAAAHWoMeWgpQkhAJsTZm4K7+1jl4NOUYyotQH+X0GAoDdGmBEfGrZ4s5eUo0cZwPOJrEQ4XD+lUUBjKuC1oAwzP8QAAAAQN4Lazp2QAAAAAAAAAAAK8AAAAAAAAAAAAAAAAAAAAZAX14QAAACcQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');


--
-- Data for Name: offers; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: peers; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: publishqueue; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: pubsub; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: scphistory; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.scphistory VALUES ('GDVV3C2TQKU7CYLLCES5EXJWQSMLJC33J3IKOBHZ6UWJ44ASOJ7OOIVH', 2, 'AAAAAOtdi1OCqfFhaxEl0l02hJi0i3tO0KcE+fUsnnAScn7nAAAAAAAAAAIAAAACAAAAAQAAAEjqdxPgdw8bJDPV/7IRHFM4+FU5ML+fKIXR2JD/vG7PXwAAAABbrjIqAAAAAgAAAAgAAAABAAAACgAAAAgAAAADAAAnEAAAAAAAAAABee12sYKMH2kWScdOhJ4hs74Dos7GHp7m4FMcW+5z4iIAAABADsR1ensZYiV8ncpG3rNGPAA/yPJYCoRR+3Ti8iT352VHKOnU9WvWJz7TwjsDtVwOX1PCbL9rQ1Z73+WiZMzwAQ==');
INSERT INTO public.scphistory VALUES ('GDVV3C2TQKU7CYLLCES5EXJWQSMLJC33J3IKOBHZ6UWJ44ASOJ7OOIVH', 3, 'AAAAAOtdi1OCqfFhaxEl0l02hJi0i3tO0KcE+fUsnnAScn7nAAAAAAAAAAMAAAACAAAAAQAAADCeKvGtTwRPXNgN6EHQ/7OcOgUkQAUARlgXfreXnadLPQAAAABbrjIrAAAAAAAAAAAAAAABee12sYKMH2kWScdOhJ4hs74Dos7GHp7m4FMcW+5z4iIAAABAgfKkyW4nEbbGP9uuUXXkcc4a3SFE+stxLgEOgS0LWUeNCTnFg5xd/SseHUdUaHhM/9S4T5r5OMPn8/d3cvZcDw==');
INSERT INTO public.scphistory VALUES ('GDVV3C2TQKU7CYLLCES5EXJWQSMLJC33J3IKOBHZ6UWJ44ASOJ7OOIVH', 4, 'AAAAAOtdi1OCqfFhaxEl0l02hJi0i3tO0KcE+fUsnnAScn7nAAAAAAAAAAQAAAACAAAAAQAAADBt+YsWQwvRueil/KEnukpT4Achue0uddfhtQ2NYqfZQQAAAABbrjIsAAAAAAAAAAAAAAABee12sYKMH2kWScdOhJ4hs74Dos7GHp7m4FMcW+5z4iIAAABA6w1cQstE5RsDGLD3j0LcARECk8cLqOnurVfTd8Htta5lxh9LR7oS+dLJSPnvqUgkaViJoep8IdxNZfvvwGJSCg==');


--
-- Data for Name: scpquorums; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.scpquorums VALUES ('79ed76b1828c1f691649c74e849e21b3be03a2cec61e9ee6e0531c5bee73e222', 4, 'AAAAAQAAAAEAAAAA612LU4Kp8WFrESXSXTaEmLSLe07QpwT59SyecBJyfucAAAAA');


--
-- Data for Name: signers; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.signers VALUES ('GDQWLXN6B7IVBJ2Z2DB2VAEHYEJT4POZBB5DVPL2GWJ67YRSYPLTZ6WC', 'GCVIRZIN4CGYY56CSL7RYAFHKQTGE34GIASZ2D4IGZGV3FDL622LPQZT', 1);


--
-- Data for Name: storestate; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.storestate VALUES ('lastclosedledger                ', 'd4ad6f562ffb0ccccee85a10f0da3c350ba3f300a23b1e13e54b4bdfae7ae61f');
INSERT INTO public.storestate VALUES ('historyarchivestate             ', '{
    "version": 1,
    "server": "v10.0.0",
    "currentLedger": 4,
    "currentBuckets": [
        {
            "curr": "71f84b1597ecf370e39da655a79a24852b9e05590b90e8e1945762d8d29e03a3",
            "next": {
                "state": 0
            },
            "snap": "207adaadb2dc28d1b3e280821e28da66b38511950d1d442869acaf08746d74cc"
        },
        {
            "curr": "ef31a20a398ee73ce22275ea8177786bac54656f33dcc4f3fec60d55ddf163d9",
            "next": {
                "state": 1,
                "output": "207adaadb2dc28d1b3e280821e28da66b38511950d1d442869acaf08746d74cc"
            },
            "snap": "0000000000000000000000000000000000000000000000000000000000000000"
        },
        {
            "curr": "0000000000000000000000000000000000000000000000000000000000000000",
            "next": {
                "state": 0
            },
            "snap": "0000000000000000000000000000000000000000000000000000000000000000"
        },
        {
            "curr": "0000000000000000000000000000000000000000000000000000000000000000",
            "next": {
                "state": 0
            },
            "snap": "0000000000000000000000000000000000000000000000000000000000000000"
        },
        {
            "curr": "0000000000000000000000000000000000000000000000000000000000000000",
            "next": {
                "state": 0
            },
            "snap": "0000000000000000000000000000000000000000000000000000000000000000"
        },
        {
            "curr": "0000000000000000000000000000000000000000000000000000000000000000",
            "next": {
                "state": 0
            },
            "snap": "0000000000000000000000000000000000000000000000000000000000000000"
        },
        {
            "curr": "0000000000000000000000000000000000000000000000000000000000000000",
            "next": {
                "state": 0
            },
            "snap": "0000000000000000000000000000000000000000000000000000000000000000"
        },
        {
            "curr": "0000000000000000000000000000000000000000000000000000000000000000",
            "next": {
                "state": 0
            },
            "snap": "0000000000000000000000000000000000000000000000000000000000000000"
        },
        {
            "curr": "0000000000000000000000000000000000000000000000000000000000000000",
            "next": {
                "state": 0
            },
            "snap": "0000000000000000000000000000000000000000000000000000000000000000"
        },
        {
            "curr": "0000000000000000000000000000000000000000000000000000000000000000",
            "next": {
                "state": 0
            },
            "snap": "0000000000000000000000000000000000000000000000000000000000000000"
        },
        {
            "curr": "0000000000000000000000000000000000000000000000000000000000000000",
            "next": {
                "state": 0
            },
            "snap": "0000000000000000000000000000000000000000000000000000000000000000"
        }
    ]
}');
INSERT INTO public.storestate VALUES ('lastscpdata                     ', 'AAAAAgAAAADrXYtTgqnxYWsRJdJdNoSYtIt7TtCnBPn1LJ5wEnJ+5wAAAAAAAAAEAAAAA3ntdrGCjB9pFknHToSeIbO+A6LOxh6e5uBTHFvuc+IiAAAAAQAAADBt+YsWQwvRueil/KEnukpT4Achue0uddfhtQ2NYqfZQQAAAABbrjIsAAAAAAAAAAAAAAABAAAAMG35ixZDC9G56KX8oSe6SlPgByG57S511+G1DY1ip9lBAAAAAFuuMiwAAAAAAAAAAAAAAEB2DBi/Viehmy1h9GcEThlXiGo4GG19klTmUFxWhFKQh33HNaC/9hvAOJ4O8Pt6HXSnVuXRy9rA6Ss1mu+58c8BAAAAAOtdi1OCqfFhaxEl0l02hJi0i3tO0KcE+fUsnnAScn7nAAAAAAAAAAQAAAACAAAAAQAAADBt+YsWQwvRueil/KEnukpT4Achue0uddfhtQ2NYqfZQQAAAABbrjIsAAAAAAAAAAAAAAABee12sYKMH2kWScdOhJ4hs74Dos7GHp7m4FMcW+5z4iIAAABA6w1cQstE5RsDGLD3j0LcARECk8cLqOnurVfTd8Htta5lxh9LR7oS+dLJSPnvqUgkaViJoep8IdxNZfvvwGJSCgAAAAHSedmHWeHcFaLUEnD8gAKk9CXRE7jmO2zpQecniN49lwAAAAEAAAAAqojlDeCNjHfCkv8cAKdUJmJvhkAlnQ+INk1dlGv2tLcAAABkAAAAAgAAAAEAAAAAAAAAAAAAAAEAAAAAAAAACgAAAAl0ZXN0X2RhdGEAAAAAAAABAAAACnRlc3RfdmFsdWUAAAAAAAAAAAABa/a0twAAAEDIECPO8kfwRphAjTs+Mpck3akbBzAjoc09tPX7vp6FsT+pV7Kc/PPJIXnRA3CYEmvySJl1nOtaav8SNfuKq6sMAAAAAQAAAAEAAAABAAAAAOtdi1OCqfFhaxEl0l02hJi0i3tO0KcE+fUsnnAScn7nAAAAAA==');
INSERT INTO public.storestate VALUES ('databaseschema                  ', '7');
INSERT INTO public.storestate VALUES ('networkpassphrase               ', 'Test SDF Network ; September 2015');
INSERT INTO public.storestate VALUES ('forcescponnextlaunch            ', 'false');
INSERT INTO public.storestate VALUES ('ledgerupgrades                  ', '{
    "time": 0,
    "version": {
        "has": false
    },
    "fee": {
        "has": false
    },
    "maxtxsize": {
        "has": false
    },
    "reserve": {
        "has": false
    }
}');


--
-- Data for Name: trustlines; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.trustlines VALUES ('GCY7C4WARB7NIABS3JRKK54A5NQSIVF4L5CIWIBPB6GKFOSESRLZVNMZ', 1, 'GBTVGCI5OYBGDMCNKYFVSETXK6TTOQ4DRJBAC5K2PUUNSVB24PPSQ26Q', 'KHL', 9223372036854775807, 0, 1, 3, NULL, NULL);


--
-- Data for Name: txfeehistory; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.txfeehistory VALUES ('c3bc990f06136ed43088920f58ae2ae034b3075992637d2eeb0a9d351d4eba91', 2, 1, 'AAAAAgAAAAMAAAABAAAAAAAAAABi/B0L0JGythwN1lY0aypo19NHxvLCyO5tBEcCVvwF9w3gtrOnZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEAAAACAAAAAAAAAABi/B0L0JGythwN1lY0aypo19NHxvLCyO5tBEcCVvwF9w3gtrOnY/+cAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAA==');
INSERT INTO public.txfeehistory VALUES ('647646ee4cb26f006f58546fdf0423ebe44fcecd277c12f4983c1e180af1d390', 2, 2, 'AAAAAgAAAAMAAAACAAAAAAAAAABi/B0L0JGythwN1lY0aypo19NHxvLCyO5tBEcCVvwF9w3gtrOnY/+cAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEAAAACAAAAAAAAAABi/B0L0JGythwN1lY0aypo19NHxvLCyO5tBEcCVvwF9w3gtrOnY/84AAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAA==');
INSERT INTO public.txfeehistory VALUES ('d714bde56f5d745a06770fbd31eb9751a9988f5be625cfebfeef578767d6bd89', 2, 3, 'AAAAAgAAAAMAAAACAAAAAAAAAABi/B0L0JGythwN1lY0aypo19NHxvLCyO5tBEcCVvwF9w3gtrOnY/84AAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEAAAACAAAAAAAAAABi/B0L0JGythwN1lY0aypo19NHxvLCyO5tBEcCVvwF9w3gtrOnY/7UAAAAAAAAAAMAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAA==');
INSERT INTO public.txfeehistory VALUES ('df29b2cead92334dbd7d778ac90e27dfe281cdd979b3a24e228d62e30efafa01', 2, 4, 'AAAAAgAAAAMAAAACAAAAAAAAAABi/B0L0JGythwN1lY0aypo19NHxvLCyO5tBEcCVvwF9w3gtrOnY/7UAAAAAAAAAAMAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEAAAACAAAAAAAAAABi/B0L0JGythwN1lY0aypo19NHxvLCyO5tBEcCVvwF9w3gtrOnY/5wAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAA==');
INSERT INTO public.txfeehistory VALUES ('6bbe6b17bb71d7429dc9476fd77c5f9a18b915fd11f2c8b54e9029ae6554f6ef', 3, 1, 'AAAAAgAAAAMAAAACAAAAAAAAAADhZd2+D9FQp1nQw6qAh8ETPj3ZCHo6vXo1k+/iMsPXPAAAAAJUC+QAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEAAAADAAAAAAAAAADhZd2+D9FQp1nQw6qAh8ETPj3ZCHo6vXo1k+/iMsPXPAAAAAJUC+OcAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAA==');
INSERT INTO public.txfeehistory VALUES ('88b573ac5441c3934ae6d849c93429bcaa8d83823581b7d72227c8cf06389dd7', 3, 2, 'AAAAAgAAAAMAAAACAAAAAAAAAACx8XLAiH7UADLaYqV3gOthJFS8X0SLIC8PjKK6RJRXmgAAAAJUC+QAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEAAAADAAAAAAAAAACx8XLAiH7UADLaYqV3gOthJFS8X0SLIC8PjKK6RJRXmgAAAAJUC+OcAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAA==');
INSERT INTO public.txfeehistory VALUES ('b5f4d71a8ef136431f9495c3747c70a97a9dc4f33322ed7bd09174975d150ccf', 4, 1, 'AAAAAgAAAAMAAAACAAAAAAAAAACqiOUN4I2Md8KS/xwAp1QmYm+GQCWdD4g2TV2Ua/a0twAAAAJUC+QAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEAAAAEAAAAAAAAAACqiOUN4I2Md8KS/xwAp1QmYm+GQCWdD4g2TV2Ua/a0twAAAAJUC+OcAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAA==');


--
-- Data for Name: txhistory; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.txhistory VALUES ('c3bc990f06136ed43088920f58ae2ae034b3075992637d2eeb0a9d351d4eba91', 2, 1, 'AAAAAGL8HQvQkbK2HA3WVjRrKmjX00fG8sLI7m0ERwJW/AX3AAAAZAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAZ1MJHXYCYbBNVgtZEndXpzdDg4pCAXVafSjZVDrj3ygAAAACVAvkAAAAAAAAAAABVvwF9wAAAECtxau60cUj7Xmb5/v7/RJe/SgqWkTSt1qH9hLERe2YcepDcF2FD97zxUpZ6bDbDdLMMrvboV5Gh+k8C29EOtoI', 'w7yZDwYTbtQwiJIPWK4q4DSzB1mSY30u6wqdNR1OupEAAAAAAAAAZAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAA==', 'AAAAAQAAAAAAAAABAAAAAgAAAAAAAAACAAAAAAAAAABnUwkddgJhsE1WC1kSd1enN0ODikIBdVp9KNlUOuPfKAAAAAJUC+QAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEAAAACAAAAAAAAAABi/B0L0JGythwN1lY0aypo19NHxvLCyO5tBEcCVvwF9w3gtrFTWBpwAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAA==');
INSERT INTO public.txhistory VALUES ('647646ee4cb26f006f58546fdf0423ebe44fcecd277c12f4983c1e180af1d390', 2, 2, 'AAAAAGL8HQvQkbK2HA3WVjRrKmjX00fG8sLI7m0ERwJW/AX3AAAAZAAAAAAAAAACAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAA4WXdvg/RUKdZ0MOqgIfBEz492Qh6Or16NZPv4jLD1zwAAAACVAvkAAAAAAAAAAABVvwF9wAAAEBPmU8p7LrGpKUCz4qQmbxOYYwkfYyKe8ZKtRw6F5hNvD6YpGQAkPEsiCI8N4JrpKnkkHD3cIsYeWexHhCtoiMI', 'ZHZG7kyybwBvWFRv3wQj6+RPzs0nfBL0mDweGArx05AAAAAAAAAAZAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAA==', 'AAAAAQAAAAAAAAABAAAAAgAAAAAAAAACAAAAAAAAAADhZd2+D9FQp1nQw6qAh8ETPj3ZCHo6vXo1k+/iMsPXPAAAAAJUC+QAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEAAAACAAAAAAAAAABi/B0L0JGythwN1lY0aypo19NHxvLCyO5tBEcCVvwF9w3gtq7/TDZwAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAA==');
INSERT INTO public.txhistory VALUES ('d714bde56f5d745a06770fbd31eb9751a9988f5be625cfebfeef578767d6bd89', 2, 3, 'AAAAAGL8HQvQkbK2HA3WVjRrKmjX00fG8sLI7m0ERwJW/AX3AAAAZAAAAAAAAAADAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAqojlDeCNjHfCkv8cAKdUJmJvhkAlnQ+INk1dlGv2tLcAAAACVAvkAAAAAAAAAAABVvwF9wAAAEBAc9IDiA8bdVg97qNJIb8Yx9njHJOfouobKw1unDu40/rULoP64v1felhxDEUwSdYvHpdaoIUWIKZA9eQrdBEF', '1xS95W9ddFoGdw+9MeuXUamYj1vmJc/r/u9Xh2fWvYkAAAAAAAAAZAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAA==', 'AAAAAQAAAAAAAAABAAAAAgAAAAAAAAACAAAAAAAAAACqiOUN4I2Md8KS/xwAp1QmYm+GQCWdD4g2TV2Ua/a0twAAAAJUC+QAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEAAAACAAAAAAAAAABi/B0L0JGythwN1lY0aypo19NHxvLCyO5tBEcCVvwF9w3gtqyrQFJwAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAA==');
INSERT INTO public.txhistory VALUES ('df29b2cead92334dbd7d778ac90e27dfe281cdd979b3a24e228d62e30efafa01', 2, 4, 'AAAAAGL8HQvQkbK2HA3WVjRrKmjX00fG8sLI7m0ERwJW/AX3AAAAZAAAAAAAAAAEAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAsfFywIh+1AAy2mKld4DrYSRUvF9EiyAvD4yiukSUV5oAAAACVAvkAAAAAAAAAAABVvwF9wAAAEDaB9j+85KWEwq2Kcm27EII9PxWWEwQa1Yh9gtxy7OwncgzEwihyqfVStaODWBy+JEjZ6ySL2GbHeLeKkJx44sI', '3ymyzq2SM029fXeKyQ4n3+KBzdl5s6JOIo1i4w76+gEAAAAAAAAAZAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAA==', 'AAAAAQAAAAAAAAABAAAAAgAAAAAAAAACAAAAAAAAAACx8XLAiH7UADLaYqV3gOthJFS8X0SLIC8PjKK6RJRXmgAAAAJUC+QAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEAAAACAAAAAAAAAABi/B0L0JGythwN1lY0aypo19NHxvLCyO5tBEcCVvwF9w3gtqpXNG5wAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAA==');
INSERT INTO public.txhistory VALUES ('6bbe6b17bb71d7429dc9476fd77c5f9a18b915fd11f2c8b54e9029ae6554f6ef', 3, 1, 'AAAAAOFl3b4P0VCnWdDDqoCHwRM+PdkIejq9ejWT7+Iyw9c8AAAAZAAAAAIAAAABAAAAAAAAAAAAAAABAAAAAAAAAAUAAAAAAAAAAQAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAACqiOUN4I2Md8KS/xwAp1QmYm+GQCWdD4g2TV2Ua/a0twAAAAEAAAAAAAAAATLD1zwAAABATfVpGYYrQJilxLxmEJbz/XeOhzLM1jox/4U6o6R7HUWtwmrtMAHpj3lmFJnF+jRfl74AV3fA1Mo8OU1dVJhaDA==', 'a75rF7tx10KdyUdv13xfmhi5Ff0R8si1TpAprmVU9u8AAAAAAAAAZAAAAAAAAAABAAAAAAAAAAUAAAAAAAAAAA==', 'AAAAAQAAAAIAAAADAAAAAwAAAAAAAAAA4WXdvg/RUKdZ0MOqgIfBEz492Qh6Or16NZPv4jLD1zwAAAACVAvjnAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAABAAAAAwAAAAAAAAAA4WXdvg/RUKdZ0MOqgIfBEz492Qh6Or16NZPv4jLD1zwAAAACVAvjnAAAAAIAAAABAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAABAAAAAgAAAAMAAAADAAAAAAAAAADhZd2+D9FQp1nQw6qAh8ETPj3ZCHo6vXo1k+/iMsPXPAAAAAJUC+OcAAAAAgAAAAEAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEAAAADAAAAAAAAAADhZd2+D9FQp1nQw6qAh8ETPj3ZCHo6vXo1k+/iMsPXPAAAAAJUC+OcAAAAAgAAAAEAAAABAAAAAAAAAAAAAAAAAQAAAAAAAAEAAAAAqojlDeCNjHfCkv8cAKdUJmJvhkAlnQ+INk1dlGv2tLcAAAABAAAAAAAAAAA=');
INSERT INTO public.txhistory VALUES ('88b573ac5441c3934ae6d849c93429bcaa8d83823581b7d72227c8cf06389dd7', 3, 2, 'AAAAALHxcsCIftQAMtpipXeA62EkVLxfRIsgLw+MorpElFeaAAAAZAAAAAIAAAABAAAAAAAAAAAAAAABAAAAAAAAAAYAAAABS0hMAAAAAABnUwkddgJhsE1WC1kSd1enN0ODikIBdVp9KNlUOuPfKH//////////AAAAAAAAAAFElFeaAAAAQF5t+G+v86jAxeXKuSMO5o/A5+qMFT5dPN60bDohBzBFRDV7j3fbt9buXnAkEVAnMVRCDj7VZGRTBlGPpenErgs=', 'iLVzrFRBw5NK5thJyTQpvKqNg4I1gbfXIifIzwY4ndcAAAAAAAAAZAAAAAAAAAABAAAAAAAAAAYAAAAAAAAAAA==', 'AAAAAQAAAAIAAAADAAAAAwAAAAAAAAAAsfFywIh+1AAy2mKld4DrYSRUvF9EiyAvD4yiukSUV5oAAAACVAvjnAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAABAAAAAwAAAAAAAAAAsfFywIh+1AAy2mKld4DrYSRUvF9EiyAvD4yiukSUV5oAAAACVAvjnAAAAAIAAAABAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAABAAAAAwAAAAAAAAADAAAAAQAAAACx8XLAiH7UADLaYqV3gOthJFS8X0SLIC8PjKK6RJRXmgAAAAFLSEwAAAAAAGdTCR12AmGwTVYLWRJ3V6c3Q4OKQgF1Wn0o2VQ6498oAAAAAAAAAAB//////////wAAAAEAAAAAAAAAAAAAAAMAAAADAAAAAAAAAACx8XLAiH7UADLaYqV3gOthJFS8X0SLIC8PjKK6RJRXmgAAAAJUC+OcAAAAAgAAAAEAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEAAAADAAAAAAAAAACx8XLAiH7UADLaYqV3gOthJFS8X0SLIC8PjKK6RJRXmgAAAAJUC+OcAAAAAgAAAAEAAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAA==');
INSERT INTO public.txhistory VALUES ('b5f4d71a8ef136431f9495c3747c70a97a9dc4f33322ed7bd09174975d150ccf', 4, 1, 'AAAAAKqI5Q3gjYx3wpL/HACnVCZib4ZAJZ0PiDZNXZRr9rS3AAAAZAAAAAIAAAABAAAAAAAAAAAAAAABAAAAAAAAAAoAAAAJdGVzdF9kYXRhAAAAAAAAAQAAAAp0ZXN0X3ZhbHVlAAAAAAAAAAAAAWv2tLcAAABAyBAjzvJH8EaYQI07PjKXJN2pGwcwI6HNPbT1+76ehbE/qVeynPzzySF50QNwmBJr8kiZdZzrWmr/EjX7iqurDA==', 'tfTXGo7xNkMflJXDdHxwqXqdxPMzIu170JF0l10VDM8AAAAAAAAAZAAAAAAAAAABAAAAAAAAAAoAAAAAAAAAAA==', 'AAAAAQAAAAIAAAADAAAABAAAAAAAAAAAqojlDeCNjHfCkv8cAKdUJmJvhkAlnQ+INk1dlGv2tLcAAAACVAvjnAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAABAAAABAAAAAAAAAAAqojlDeCNjHfCkv8cAKdUJmJvhkAlnQ+INk1dlGv2tLcAAAACVAvjnAAAAAIAAAABAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAABAAAAAwAAAAAAAAAEAAAAAwAAAACqiOUN4I2Md8KS/xwAp1QmYm+GQCWdD4g2TV2Ua/a0twAAAAl0ZXN0X2RhdGEAAAAAAAAKdGVzdF92YWx1ZQAAAAAAAAAAAAAAAAADAAAABAAAAAAAAAAAqojlDeCNjHfCkv8cAKdUJmJvhkAlnQ+INk1dlGv2tLcAAAACVAvjnAAAAAIAAAABAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAABAAAABAAAAAAAAAAAqojlDeCNjHfCkv8cAKdUJmJvhkAlnQ+INk1dlGv2tLcAAAACVAvjnAAAAAIAAAABAAAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAA=');


--
-- Data for Name: upgradehistory; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.upgradehistory VALUES (2, 1, 'AAAAAQAAAAo=', 'AAAAAA==');
INSERT INTO public.upgradehistory VALUES (2, 2, 'AAAAAwAAJxA=', 'AAAAAA==');


--
-- Name: accountdata accountdata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accountdata
    ADD CONSTRAINT accountdata_pkey PRIMARY KEY (accountid, dataname);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (accountid);


--
-- Name: ban ban_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ban
    ADD CONSTRAINT ban_pkey PRIMARY KEY (nodeid);


--
-- Name: ledgerheaders ledgerheaders_ledgerseq_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ledgerheaders
    ADD CONSTRAINT ledgerheaders_ledgerseq_key UNIQUE (ledgerseq);


--
-- Name: ledgerheaders ledgerheaders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ledgerheaders
    ADD CONSTRAINT ledgerheaders_pkey PRIMARY KEY (ledgerhash);


--
-- Name: offers offers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_pkey PRIMARY KEY (offerid);


--
-- Name: peers peers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.peers
    ADD CONSTRAINT peers_pkey PRIMARY KEY (ip, port);


--
-- Name: publishqueue publishqueue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.publishqueue
    ADD CONSTRAINT publishqueue_pkey PRIMARY KEY (ledger);


--
-- Name: pubsub pubsub_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pubsub
    ADD CONSTRAINT pubsub_pkey PRIMARY KEY (resid);


--
-- Name: scpquorums scpquorums_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scpquorums
    ADD CONSTRAINT scpquorums_pkey PRIMARY KEY (qsethash);


--
-- Name: signers signers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signers
    ADD CONSTRAINT signers_pkey PRIMARY KEY (accountid, publickey);


--
-- Name: storestate storestate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.storestate
    ADD CONSTRAINT storestate_pkey PRIMARY KEY (statename);


--
-- Name: trustlines trustlines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trustlines
    ADD CONSTRAINT trustlines_pkey PRIMARY KEY (accountid, issuer, assetcode);


--
-- Name: txfeehistory txfeehistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.txfeehistory
    ADD CONSTRAINT txfeehistory_pkey PRIMARY KEY (ledgerseq, txindex);


--
-- Name: txhistory txhistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.txhistory
    ADD CONSTRAINT txhistory_pkey PRIMARY KEY (ledgerseq, txindex);


--
-- Name: upgradehistory upgradehistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.upgradehistory
    ADD CONSTRAINT upgradehistory_pkey PRIMARY KEY (ledgerseq, upgradeindex);


--
-- Name: accountbalances; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX accountbalances ON public.accounts USING btree (balance) WHERE (balance >= 1000000000);


--
-- Name: buyingissuerindex; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX buyingissuerindex ON public.offers USING btree (buyingissuer);


--
-- Name: histbyseq; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX histbyseq ON public.txhistory USING btree (ledgerseq);


--
-- Name: histfeebyseq; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX histfeebyseq ON public.txfeehistory USING btree (ledgerseq);


--
-- Name: ledgersbyseq; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ledgersbyseq ON public.ledgerheaders USING btree (ledgerseq);


--
-- Name: priceindex; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX priceindex ON public.offers USING btree (price);


--
-- Name: scpenvsbyseq; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX scpenvsbyseq ON public.scphistory USING btree (ledgerseq);


--
-- Name: scpquorumsbyseq; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX scpquorumsbyseq ON public.scpquorums USING btree (lastledgerseq);


--
-- Name: sellingissuerindex; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sellingissuerindex ON public.offers USING btree (sellingissuer);


--
-- Name: signersaccount; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX signersaccount ON public.signers USING btree (accountid);


--
-- Name: upgradehistbyseq; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX upgradehistbyseq ON public.upgradehistory USING btree (ledgerseq);


--
-- PostgreSQL database dump complete
--

