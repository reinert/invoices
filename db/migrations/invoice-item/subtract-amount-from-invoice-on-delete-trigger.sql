CREATE OR REPLACE FUNCTION subtract_amount_from_invoice_on_delete() RETURNS trigger AS $subtract_amount_from_invoice_on_delete$
    BEGIN
        UPDATE invoices SET amount = (coalesce(amount, 0) - (OLD.unit_price * OLD.quantity)::numeric(10,2)) WHERE id = OLD.invoice_id;

        RETURN OLD;
    END;
$subtract_amount_from_invoice_on_delete$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subtract_amount_from_invoice_on_delete_tg ON invoice_item RESTRICT; --[ CASCADE ]

CREATE TRIGGER subtract_amount_from_invoice_on_delete_tg AFTER DELETE ON invoice_items
FOR EACH ROW EXECUTE PROCEDURE subtract_amount_from_invoice_on_delete();
