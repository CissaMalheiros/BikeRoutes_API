DROP TABLE IF EXISTS coordenadas;
DROP TABLE IF EXISTS rotas;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  cpf VARCHAR(20),
  nome VARCHAR(100),
  telefone VARCHAR(30),
  sexo VARCHAR(20),
  email VARCHAR(100) UNIQUE NOT NULL,
  data_nascimento VARCHAR(20),
  senha VARCHAR(100),
  fabricante VARCHAR(100),
  modelo VARCHAR(100),
  serial VARCHAR(100),
  versao VARCHAR(50)
);

CREATE TABLE rotas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo VARCHAR(50),
  tempo VARCHAR(20),
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE coordenadas (
  id SERIAL PRIMARY KEY,
  rota_id INTEGER REFERENCES rotas(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  timestamp BIGINT
);
