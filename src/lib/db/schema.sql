-- Generated reference DDL for initial POS schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
		CREATE TYPE payment_method AS ENUM ('cash', 'qris', 'debit', 'credit');
	END IF;
END $$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
		CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'void');
	END IF;
END $$;

CREATE TABLE IF NOT EXISTS roles (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL UNIQUE,
	description TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE roles
	ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS users (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	role_id INTEGER NOT NULL REFERENCES roles(id) ON UPDATE CASCADE ON DELETE RESTRICT,
	email TEXT NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	full_name TEXT NOT NULL,
	avatar_url TEXT,
	is_active BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
	id TEXT PRIMARY KEY,
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	expires_at TIMESTAMPTZ NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL UNIQUE,
	description TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	category_id INTEGER REFERENCES categories(id) ON UPDATE CASCADE ON DELETE SET NULL,
	sku TEXT NOT NULL UNIQUE,
	name TEXT NOT NULL,
	description TEXT,
	price NUMERIC(12, 2) NOT NULL DEFAULT 0,
	is_active BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_category_idx ON products (category_id);

CREATE TABLE IF NOT EXISTS customers (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name TEXT NOT NULL,
	email TEXT,
	phone TEXT,
	address TEXT,
	notes TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kosan_room_status') THEN
		CREATE TYPE kosan_room_status AS ENUM ('kosong', 'terisi');
	END IF;
END $$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kosan_tenant_status') THEN
		CREATE TYPE kosan_tenant_status AS ENUM ('aktif', 'keluar');
	END IF;
END $$;

CREATE TABLE IF NOT EXISTS gedung_kosan (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	nama_gedung TEXT NOT NULL,
	alamat TEXT NOT NULL,
	keterangan TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ruangan_kosan (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	gedung_id UUID NOT NULL REFERENCES gedung_kosan(id) ON UPDATE CASCADE ON DELETE RESTRICT,
	nama_ruangan TEXT NOT NULL,
	lantai TEXT,
	kapasitas INTEGER NOT NULL DEFAULT 1,
	status kosan_room_status NOT NULL DEFAULT 'kosong',
	harga_bulanan NUMERIC(12, 2) NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ruangan_kosan_gedung_idx ON ruangan_kosan (gedung_id);
CREATE INDEX IF NOT EXISTS ruangan_kosan_status_idx ON ruangan_kosan (status);

CREATE TABLE IF NOT EXISTS penghuni_kosan (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	pelanggan_id UUID NOT NULL REFERENCES customers(id) ON UPDATE CASCADE ON DELETE RESTRICT,
	gedung_id UUID NOT NULL REFERENCES gedung_kosan(id) ON UPDATE CASCADE ON DELETE RESTRICT,
	ruangan_id UUID NOT NULL REFERENCES ruangan_kosan(id) ON UPDATE CASCADE ON DELETE RESTRICT,
	tanggal_masuk DATE NOT NULL,
	tanggal_keluar DATE,
	status kosan_tenant_status NOT NULL DEFAULT 'aktif',
	catatan TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS penghuni_kosan_pelanggan_idx ON penghuni_kosan (pelanggan_id);
CREATE INDEX IF NOT EXISTS penghuni_kosan_ruangan_idx ON penghuni_kosan (ruangan_id);
CREATE INDEX IF NOT EXISTS penghuni_kosan_status_idx ON penghuni_kosan (status);
CREATE INDEX IF NOT EXISTS penghuni_kosan_gedung_idx ON penghuni_kosan (gedung_id);

CREATE TABLE IF NOT EXISTS transactions (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	number TEXT NOT NULL UNIQUE,
	user_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
	customer_id UUID REFERENCES customers(id) ON UPDATE CASCADE ON DELETE SET NULL,
	subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
	tax NUMERIC(12, 2) NOT NULL DEFAULT 0,
	discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
	total NUMERIC(12, 2) NOT NULL,
	status transaction_status NOT NULL DEFAULT 'completed',
	note TEXT,
	metadata JSONB,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transactions_user_idx ON transactions (user_id);
CREATE INDEX IF NOT EXISTS transactions_customer_idx ON transactions (customer_id);

CREATE TABLE IF NOT EXISTS transaction_items (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
	product_id UUID NOT NULL REFERENCES products(id) ON UPDATE CASCADE ON DELETE RESTRICT,
	quantity INTEGER NOT NULL DEFAULT 1,
	unit_price NUMERIC(12, 2) NOT NULL,
	total_price NUMERIC(12, 2) NOT NULL,
	note TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transaction_items_transaction_idx ON transaction_items (transaction_id);
CREATE INDEX IF NOT EXISTS transaction_items_product_idx ON transaction_items (product_id);

CREATE TABLE IF NOT EXISTS payments (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
	amount NUMERIC(12, 2) NOT NULL,
	method payment_method NOT NULL,
	status TEXT NOT NULL DEFAULT 'paid',
	reference TEXT,
	paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	metadata JSONB,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_transaction_idx ON payments (transaction_id);
