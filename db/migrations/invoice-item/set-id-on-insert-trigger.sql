CREATE OR REPLACE FUNCTION set_id_on_insert() RETURNS trigger AS $set_id_on_insert$
    BEGIN
        IF NEW.id IS NULL THEN
          NEW.id = (SELECT coalesce(max(id), 0) FROM invoice_items WHERE invoice_id = NEW.invoice_id) + 1;
        END IF;
        RETURN NEW;
    END;
$set_id_on_insert$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_id_on_insert_tg ON invoice_item RESTRICT; --[ CASCADE ]

CREATE TRIGGER set_id_on_insert_tg BEFORE INSERT ON invoice_items
FOR EACH ROW EXECUTE PROCEDURE set_id_on_insert();