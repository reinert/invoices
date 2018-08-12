SET SCHEMA 'invoices';

CREATE TABLE invoice_items (
  invoice_id bigint NOT NULL,
  id smallint NOT NULL,
  quantity numeric(12, 2) NOT NULL,
  unit_price numeric(12, 2) NOT NULL,
  description text,

  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,

  CONSTRAINT invoice_items_pk PRIMARY KEY (invoice_id, id),
  CONSTRAINT invoice_items_invoices_fk FOREIGN KEY (invoice_id)
    REFERENCES invoices (id) MATCH SIMPLE
    ON UPDATE CASCADE ON DELETE CASCADE
);

--[ Gets the next item id based on the parent invoice ]--
CREATE FUNCTION next_invoice_item_id (invoice_id bigint)
  RETURNS smallint AS
$$
DECLARE
  new_id smallint;
BEGIN
  UPDATE invoices.invoices set items_seq = items_seq + 1 WHERE id = invoice_id
    RETURNING items_seq INTO new_id;
  RETURN new_id;
END;
$$ LANGUAGE 'plpgsql';

CREATE FUNCTION set_invoice_item_id_on_insert ()
  RETURNS TRIGGER AS
$$
BEGIN
  NEW.id = invoices.next_invoice_item_id(NEW.invoice_id);
  RETURN NEW;
END
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER set_invoice_item_id_on_insert_tg BEFORE INSERT ON invoice_items
  FOR EACH ROW EXECUTE PROCEDURE set_invoice_item_id_on_insert ();

--[ Updates parent invoice amount on item insert or update ]--
CREATE FUNCTION add_amount_to_invoice_on_upsert ()
  RETURNS trigger AS
$$
DECLARE
  new_amount numeric(12, 2);
  old_amount numeric(12, 2);
BEGIN
  new_amount := (NEW.unit_price * NEW.quantity);

  IF TG_OP = 'INSERT' THEN
    UPDATE invoices.invoices
      SET amount = (coalesce(amount, 0) + new_amount)
      WHERE id = NEW.invoice_id;
  ELSE
    old_amount := (OLD.unit_price * OLD.quantity);
    IF old_amount != new_amount THEN
      UPDATE invoices.invoices
        SET amount = (coalesce(amount, 0) - old_amount + new_amount)
        WHERE id = NEW.invoice_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER add_amount_to_invoice_on_upsert_tg
  AFTER INSERT OR UPDATE OF unit_price, quantity
  ON invoice_items
  FOR EACH ROW
  EXECUTE PROCEDURE add_amount_to_invoice_on_upsert();

--[ Updates parent invoice amount on item delete ]--
CREATE FUNCTION subtract_amount_from_invoice_on_delete ()
  RETURNS trigger AS $$
BEGIN
  UPDATE invoices.invoices
    SET amount = (coalesce(amount, 0) - (OLD.unit_price * OLD.quantity))
    WHERE id = OLD.invoice_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subtract_amount_from_invoice_on_delete_tg
  AFTER DELETE
  ON invoice_items
  FOR EACH ROW
  EXECUTE PROCEDURE subtract_amount_from_invoice_on_delete();

SET SCHEMA 'public';
