# Cadastro de Produtos

Sistema completo de cadastro e gerenciamento de produtos com frontend em React, backend em NestJS, banco PostgreSQL e sincronização em tempo real via WebSocket.

## Visão geral

Este projeto foi desenvolvido para gerenciar um catálogo de produtos com recursos essenciais de um sistema de estoque, incluindo:

- autenticação com JWT
- cadastro, edição e exclusão de produtos
- busca e filtros por categoria
- importação de planilhas Excel/CSV
- atualização em tempo real da interface
- integração entre frontend e backend por API REST

## Stack tecnológica

### Backend
- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- Passport + JWT
- Socket.IO
- xlsx

### Frontend
- React
- Vite
- JavaScript
- Socket.IO Client
- Lucide React

### Infraestrutura
- Docker
- Docker Compose

## Arquitetura

```text
Cadastro_de_Produtos/
├── backend/                 # API NestJS
│   ├── src/
│   ├── test/
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
├── frontend-produtos/       # Aplicação React
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
├── docker-compose.yml       # Orquestração dos serviços
├── README.md                # Documentação geral do projeto
└── .gitignore
```

## Funcionalidades principais

### Backend
- autenticação de usuário com login e token JWT
- CRUD completo de produtos
- rota de importação em massa via Excel
- WebSocket para emitir eventos de atualização
- persistência em PostgreSQL

### Frontend
- tela de login
- dashboard com métricas do estoque
- listagem de produtos com busca e filtro
- cadastro e edição de itens
- exclusão de produtos
- importação de planilhas
- atualização em tempo real após mudanças no backend

## Login padrão

Para testar o sistema localmente, utilize:

- e-mail: `admin@admin.com`
- senha: `123456`

## Como executar o projeto

### Opção 1: com Docker

Na raiz do projeto:

```bash
docker-compose up --build
```

Isso irá subir:

- PostgreSQL
- backend NestJS em `http://localhost:3000`
- frontend React em `http://localhost:80`

### Opção 2: execução manual

#### Backend

```bash
cd backend
npm install
npm run start:dev
```

#### Frontend

```bash
cd frontend-produtos
npm install
npm run dev
```

A aplicação frontend fica em:

```text
http://localhost:5173
```

## Requisitos

- Node.js 20+
- npm
- PostgreSQL
- Docker e Docker Compose (opcional)

## Endpoints principais

### Autenticação
- `POST /auth/login`

### Produtos
- `GET /products`
- `POST /products`
- `PUT /products/:id`
- `DELETE /products/:id`
- `POST /products/import`

## WebSocket

O backend emite o evento `productsUpdated` para todos os clientes conectados quando há alteração na lista de produtos.

## Observações importantes

- o backend usa `synchronize: true`, então o TypeORM pode criar a tabela automaticamente
- a autenticação atual é simples e baseada em usuário fixo de testes
- as credenciais e segredos podem ser externalizados para variáveis de ambiente em versões futuras
- o projeto está preparado para uso em ambiente de demonstração e desenvolvimento

## Documentação específica

- [backend/README.md](backend/README.md)
- [frontend-produtos/README.md](frontend-produtos/README.md)

## Próximos passos sugeridos

- externalizar variáveis de ambiente
- trocar autenticação fixa por banco de usuários
- adicionar validação com DTOs mais robustos
- criar testes automatizados para backend e frontend
- melhorar a organização dos componentes do frontend

## Autor

Projeto full stack de cadastro de produtos, com backend em NestJS, frontend em React e integração em tempo real via WebSocket.
