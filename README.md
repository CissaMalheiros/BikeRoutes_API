# API BikeRoutes

API REST para gerenciamento de usuários, rotas e coordenadas de ciclistas, utilizando Node.js, Express e PostgreSQL.

## Sumário

- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Execução](#execução)
- [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
- [Rotas da API](#rotas-da-api)
- [Utilitários](#utilitários)

---

## Pré-requisitos

- Node.js >= 18
- PostgreSQL >= 13

## Instalação

1. Clone o repositório ou copie a pasta `APIByke` para seu ambiente local.
2. Instale as dependências:

  ```bash
  npm install
  ```

## Configuração

1. Crie um arquivo `.env` na raiz da pasta `APIByke` com as informações do banco de dados:

  ```env
  PORT=3001
  PGUSER=SEU_USUARIO
  PGPASSWORD=SUA_SENHA
  PGHOST=SEU_HOST
  PGPORT=5433
  PGDATABASE=SEU_BANCO
  ```

1. Crie as tabelas no banco de dados usando o script `modelo.sql`:

  ```bash
  psql -h 191.52.15.23 -p 5433 -U bikeroutes_api -d bikeroutes -f modelo.sql
  ```

## Execução

Inicie a API com:

```bash
npm start
```

A API estará disponível em `http://localhost:3001` (ou na porta definida no `.env`).

## Estrutura do Banco de Dados

- **usuarios**: id, cpf, nome, telefone, sexo, email, data_nascimento, senha, fabricante, modelo, serial, versao
- **rotas**: id, usuario_id, tipo, tempo, data
- **coordenadas**: id, rota_id, latitude, longitude, timestamp

## Rotas da API

### Usuários

- **POST /usuarios**
  - Cadastra ou atualiza um usuário pelo email.
  - Body (JSON):

   ```json
   {
    "cpf": "...",
    "nome": "...",
    "telefone": "...",
    "sexo": "...",
    "email": "...",
    "dataNascimento": "...",
    "senha": "...",
    "fabricante": "...",
    "modelo": "...",
    "serial": "...",
    "versao": "..."
   }
   ```

  - Resposta: usuário cadastrado/atualizado.

- **GET /usuarios/email/:email**
  - Busca usuário pelo email.
  - Resposta: dados do usuário.

### Rotas

- **POST /rotas**
  - Cadastra uma rota e suas coordenadas.
  - Body (JSON):

   ```json
   {
    "usuario_id": 1,
    "tipo": "escola",
    "tempo": "3:15",
    "coordenadas": [
      { "latitude": -27.01, "longitude": -48.65, "timestamp": 1749075732081 }
    ]
   }
   ```

  - Resposta: rota cadastrada.

- **GET /rotas/:usuario_id**
  - Lista todas as rotas de um usuário.
  - Resposta: array de rotas.

### Coordenadas

- **GET /coordenadas/:rota_id**
  - Lista todas as coordenadas de uma rota.
  - Resposta: array de coordenadas.

### Utilitários

- **POST /limpar-banco**
  - Limpa todas as tabelas do banco (apenas para testes/desenvolvimento).
  - Resposta: confirmação.

## Observações

- Todas as rotas aceitam e retornam JSON.
- O campo `timestamp` das coordenadas deve ser enviado como número (bigint/milissegundos).
- O campo `email` do usuário deve ser único.

---
