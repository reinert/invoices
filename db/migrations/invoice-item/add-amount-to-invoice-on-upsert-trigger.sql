CREATE OR REPLACE FUNCTION add_amount_to_invoice_on_upsert() RETURNS trigger AS $add_amount_to_invoice_on_upsert$
    DECLARE
        new_amount numeric(10,2);
        old_amount numeric(10,2);
    BEGIN
        new_amount := (NEW.unit_price * NEW.quantity)::numeric(10,2);
        IF TG_OP = 'INSERT' THEN
            UPDATE invoices SET amount = (coalesce(amount, 0) + new_amount) WHERE id = NEW.invoice_id;
        ELSE
            old_amount := (OLD.unit_price * OLD.quantity)::numeric(10,2);
            IF old_amount != new_amount THEN
                UPDATE invoices SET amount = (coalesce(amount, 0) - old_amount + new_amount) WHERE id = NEW.invoice_id;
            END IF;
        END IF;

        RETURN NEW;
    END;
$add_amount_to_invoice_on_upsert$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS add_amount_to_invoice_on_upsert ON invoice_item RESTRICT; --[ CASCADE ]

CREATE TRIGGER add_amount_to_invoice_on_upsert_tg AFTER INSERT OR UPDATE OF unit_price, quantity ON invoice_items
FOR EACH ROW EXECUTE PROCEDURE add_amount_to_invoice_on_upsert();