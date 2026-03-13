# Projeto Avaliacao Tecnica

Estrutura:

- `server`: API NestJS com MongoDB (CRUD de clinicas, medicos e pacientes, sem autenticacao).
- `web`: Frontend Angular com menu lateral e telas de CRUD com modal de criar/editar.

## Server

### Rodar com Docker

```bash
cd server
docker compose up --build
```

API disponivel em `http://localhost:3000`.

Endpoints principais:

- `GET/POST /clinicas`
- `GET/PATCH/DELETE /clinicas/:id`
- `GET/POST /medicos`
- `GET/PATCH/DELETE /medicos/:id`
- `GET/POST /pacientes`
- `GET/PATCH/DELETE /pacientes/:id`

### Rodar local (sem Docker)

```bash
cd server
npm install
set MONGODB_URI=mongodb://localhost:27017/projeto_avaliacao
npm run start:dev
```

## Web

```bash
cd web
npm install
npm start
```

Aplicacao em `http://localhost:4202`.

O frontend usa por padrao a API em `http://localhost:3000`.
