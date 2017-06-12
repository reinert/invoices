ALTER TABLE invoices ALTER COLUMN amount SET DEFAULT 0;
ALTER TABLE invoices ADD COLUMN items_counter int DEFAULT 0;

DROP FUNCTION IF EXISTS invoice_item_next(int);

CREATE OR REPLACE FUNCTION invoice_item_next(invoice_id int)
RETURNS int AS
$$
DECLARE
   next_id int;
BEGIN
   UPDATE invoices set items_counter = items_counter + 1 WHERE id = invoice_id
     RETURNING items_counter INTO next_id;
   RETURN next_id;
END;
$$ LANGUAGE 'plpgsql';

CREATE OR REPLACE FUNCTION set_id_on_insert()
RETURNS TRIGGER AS
$$
BEGIN
   NEW.id = invoice_item_next(NEW.invoice_id);
   RETURN NEW;
END
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_id_on_insert_tg ON invoice_item RESTRICT; --[ CASCADE ]

CREATE TRIGGER set_id_on_insert_tg BEFORE INSERT ON invoice_items
FOR EACH ROW EXECUTE PROCEDURE set_id_on_insert();
