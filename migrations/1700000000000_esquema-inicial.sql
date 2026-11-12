-- Up Migration

CREATE TABLE usuarios (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  creado_en     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categorias (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  nombre     VARCHAR(60) NOT NULL,
  UNIQUE (usuario_id, nombre)
);

CREATE TABLE gastos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id   UUID NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES categorias (id),
  monto        NUMERIC(12, 2) NOT NULL CHECK (monto > 0),
  descripcion  VARCHAR(255) NOT NULL DEFAULT '',
  fecha        DATE NOT NULL,
  creado_en    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gastos_usuario_fecha ON gastos (usuario_id, fecha);

CREATE TABLE presupuestos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id   UUID NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES categorias (id),
  mes          CHAR(7) NOT NULL CHECK (mes ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  limite       NUMERIC(12, 2) NOT NULL CHECK (limite > 0),
  UNIQUE (usuario_id, categoria_id, mes)
);

-- Down Migration

DROP TABLE presupuestos;
DROP TABLE gastos;
DROP TABLE categorias;
DROP TABLE usuarios;
