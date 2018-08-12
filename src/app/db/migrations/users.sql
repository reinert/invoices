SET SCHEMA 'auth';

CREATE TYPE user_role AS ENUM ('NORMAL', 'ADMIN');

CREATE TABLE users (
  id serial NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  password text NOT NULL,
  encrypted boolean NOT NULL,
  email text NOT NULL,
  role user_role NOT NULL DEFAULT 'NORMAL',
  redefine boolean NOT NULL DEFAULT false,

  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,

  CONSTRAINT users_pk PRIMARY KEY (id),
  CONSTRAINT users_email_uq UNIQUE (email)
);

CREATE INDEX users_email_ix ON users (email);

SET SCHEMA 'public';
