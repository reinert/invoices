SET SCHEMA 'invoices';

CREATE TYPE invoice_type AS ENUM ('SIMPLE', 'DETAILED');

CREATE TABLE invoices (
  id bigserial NOT NULL,
  user_id int NOT NULL,
  type invoice_type NOT NULL,
  amount numeric(12, 2) NOT NULL DEFAULT 0,
  invoice_date timestamp with time zone NOT NULL,
  invoice_number text,
  beneficiary_name text,
  beneficiary_registration_number text,
  description text,

  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,

  items_seq smallint NOT NULL DEFAULT 0,

  CONSTRAINT invoices_pk PRIMARY KEY (id),
  CONSTRAINT invoices_users_fk FOREIGN KEY (user_id)
    REFERENCES auth.users (id) MATCH SIMPLE
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX invoices_invoice_date_ix ON invoices (invoice_date);

SET SCHEMA 'public';
