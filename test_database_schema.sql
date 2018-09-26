-- Ledger Headers -------------------------------------------------

CREATE TABLE ledgerheaders (
    ledgerhash character(64) PRIMARY KEY,
    prevhash character(64) NOT NULL,
    bucketlisthash character(64) NOT NULL,
    ledgerseq integer CHECK (ledgerseq >= 0) UNIQUE,
    closetime bigint NOT NULL CHECK (closetime >= 0),
    data text NOT NULL
);

CREATE UNIQUE INDEX ledgerheaders_pkey ON ledgerheaders(ledgerhash bpchar_ops);
CREATE UNIQUE INDEX ledgerheaders_ledgerseq_key ON ledgerheaders(ledgerseq int4_ops);
CREATE INDEX ledgersbyseq ON ledgerheaders(ledgerseq int4_ops);

-- Transactions --------------------------------------------------

CREATE TABLE txhistory (
    txid character(64) NOT NULL,
    ledgerseq integer CHECK (ledgerseq >= 0),
    txindex integer,
    txbody text NOT NULL,
    txresult text NOT NULL,
    txmeta text NOT NULL,
    CONSTRAINT txhistory_pkey PRIMARY KEY (ledgerseq, txindex)
);

CREATE UNIQUE INDEX txhistory_pkey ON txhistory(ledgerseq int4_ops,txindex int4_ops);
CREATE INDEX histbyseq ON txhistory(ledgerseq int4_ops);

CREATE TABLE txfeehistory (
  txid character(64) NOT NULL,
  ledgerseq integer CHECK (ledgerseq >= 0),
  txindex integer,
  txchanges text NOT NULL,
  CONSTRAINT txfeehistory_pkey PRIMARY KEY (ledgerseq, txindex)
);


CREATE UNIQUE INDEX txfeehistory_pkey ON txfeehistory(ledgerseq int4_ops,txindex int4_ops);
CREATE INDEX histfeebyseq ON txfeehistory(ledgerseq int4_ops);

-- Trustlines ------------------------------------------------------

CREATE TABLE trustlines (
    accountid character varying(56),
    assettype integer NOT NULL,
    issuer character varying(56),
    assetcode character varying(12),
    tlimit bigint NOT NULL CHECK (tlimit > 0),
    balance bigint NOT NULL CHECK (balance >= 0),
    flags integer NOT NULL,
    lastmodified integer NOT NULL,
    buyingliabilities bigint CHECK (buyingliabilities >= 0),
    sellingliabilities bigint CHECK (sellingliabilities >= 0),
    CONSTRAINT trustlines_pkey PRIMARY KEY (accountid, issuer, assetcode)
);

CREATE UNIQUE INDEX trustlines_pkey ON trustlines(accountid text_ops,issuer text_ops,assetcode text_ops);

-- Accounts ------------------------------------------------------

CREATE TABLE accounts (
    accountid character varying(56) PRIMARY KEY,
    balance bigint NOT NULL CHECK (balance >= 0),
    seqnum bigint NOT NULL,
    numsubentries integer NOT NULL CHECK (numsubentries >= 0),
    inflationdest character varying(56),
    homedomain character varying(32) NOT NULL,
    thresholds text NOT NULL,
    flags integer NOT NULL,
    lastmodified integer NOT NULL,
    buyingliabilities bigint CHECK (buyingliabilities >= 0),
    sellingliabilities bigint CHECK (sellingliabilities >= 0)
);

CREATE UNIQUE INDEX accounts_pkey ON accounts(accountid text_ops);
CREATE INDEX accountbalances ON accounts(balance int8_ops) WHERE balance >= 1000000000;
