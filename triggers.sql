--- || ' ' || NEW.balance || ' ' || NEW.seqnum || ' ' || NEW.numsubentries || ' ' || NEW.inflationdest || ' ' || NEW.homedomain || ' ' || NEW.thresholds || ' ' || NEW.flags
CREATE OR REPLACE FUNCTION accounts_notify()
  RETURNS trigger AS
$BODY$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    PERFORM pg_notify('accounts', TG_OP || '|' || OLD.accountid);
  ELSE
    PERFORM pg_notify('accounts', TG_OP || '|' || NEW.accountid || '|' || NEW.balance || '|' || NEW.seqnum || '|' || NEW.lastmodified);
  END IF;
  RETURN NULL;
END;
$BODY$
	LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS accounts_notify ON accounts;
CREATE TRIGGER accounts_notify AFTER INSERT OR UPDATE OR DELETE ON accounts
	FOR EACH ROW EXECUTE PROCEDURE accounts_notify();

CREATE OR REPLACE FUNCTION trust_notify()
  RETURNS trigger AS
$BODY$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    PERFORM pg_notify('trustlines', TG_OP || '|' || OLD.accountid || '|' || OLD.issuer || '|' || OLD.assetcode);
  ELSE
    PERFORM pg_notify('trustlines', TG_OP || '|' || NEW.accountid || '|' || NEW.issuer || '|' || NEW.assetcode || '|' || NEW.assettype || '|' || NEW.tlimit || '|' || NEW.balance);
  END IF;
  RETURN NULL;
END;
$BODY$
	LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trust_notify ON trustlines;
CREATE TRIGGER trust_notify AFTER INSERT OR UPDATE OR DELETE ON trustlines
	FOR EACH ROW EXECUTE PROCEDURE trust_notify();
