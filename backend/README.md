# Backend - Cadastro de Produtos

API em NestJS para gerenciar produtos com autenticação JWT, banco PostgreSQL, importação de planilhas Excel e atualização em tempo real via WebSocket.

## Visão geral

Este backend foi desenvolvido para funcionar como a camada de dados e lógica de negócios do sistema de cadastro de produtos. Ele expõe endpoints REST para listar, criar, atualizar, excluir e importar produtos, além de emitir eventos em tempo real para o frontend quando a lista é alterada.

## Tecnologias utilizadas

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- Passport + JWT
- Socket.IO / WebSockets
- xlsx para importação de arquivos Excel
- Docker e Docker Compose

## Estrutura do projeto

```text
backend/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   └── jwt.strategy.ts
│   └── products/
│       ├── dto/
│       │   └── create-product.dto.ts
│       ├── entities/
│       │   └── product.entity.ts
│       ├── products.controller.ts
│       ├── products.gateway.ts
│       ├── products.module.ts
│       └── products.service.ts
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── Dockerfile
├── README.md
├── eslint.config.mjs
├── nest-cli.json
├── package.json
├── tsconfig.build.json
├── tsconfig.json
└── .eslintrc.json
```

## Requisitos

- Node.js 20+
- npm ou yarn
- PostgreSQL 15+
- Docker e Docker Compose (opcional, para execução em container)

## Configuração do banco

A configuração atual do banco está definida no arquivo `src/app.module.ts`:

```ts
TypeOrmModule.forRoot({
  type: 'postgres',
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: '123',
  database: 'stockmanager',
  entities: [Product],
  synchronize: true,
})
```

Caso o PostgreSQL esteja sendo executado via Docker, ajuste as credenciais conforme o ambiente utilizado.

## Configuração de autenticação

O login está configurado em `src/auth/auth.service.ts` com um usuário de teste fixo:

- E-mail: `admin@admin.com`
- Senha: `123456`

O segredo do JWT foi definido em `src/auth/auth.module.ts` e `src/auth/jwt.strategy.ts`:

```ts
secret: 'SECRETO_SUPER_SEGURO'
```

## Como rodar localmente

1. Acesse a pasta do backend:

```bash
cd backend
```

2. Instale as dependências:

```bash
npm install
```

3. Certifique-se de que o PostgreSQL está ativo.

4. Inicie a aplicação em modo de desenvolvimento:

```bash
npm run start:dev
```

5. A API ficará disponível em:

```text
http://localhost:3000
```

## Scripts disponíveis

```bash
npm run build
npm run start
npm run start:dev
npm run start:prod
npm run test
npm run test:e2e
npm run lint
```

## Endpoints da API

### Autenticação

#### POST /auth/login

Realiza login e retorna um token JWT.

Exemplo de requisição:

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@admin.com",
  "password": "123456"
}
```

Resposta:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### Produtos

Todos os endpoints de produtos exigem autenticação via JWT.

#### GET /products

Lista todos os produtos cadastrados.

#### POST /products

Cria um novo produto.

Exemplo:

```http
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Teclado Mecânico",
  "category": "Periféricos",
  "price": 299.90,
  "quantity": 15,
  "sku": "SKU-1234"
}
```

#### PUT /products/:id

Atualiza um produto existente.

#### DELETE /products/:id

Remove um produto.

#### POST /products/import

Importa produtos a partir de um arquivo Excel (.xlsx ou .xls).

Exemplo de envio via curl:

```bash
curl -X POST http://localhost:3000/products/import \
  -H "Authorization: Bearer <token>" \
  -F "file=@produtos.xlsx"
```

### Estrutura esperada da planilha

A importação aceita colunas como:

- Name / Nome
- Category / Categoria
- Price / Preco
- Quantity / Quantidade
- SKU

Exemplo:

| Name | Category | Price | Quantity | SKU |
| --- | --- | ---: | ---: | --- |
| Mouse Gamer | Periféricos | 129.90 | 20 | SKU-1001 |
| Monitor 24" | Escritório | 899.00 | 8 | SKU-1002 |

## Modelo de dados

A entidade `Product` possui os seguintes campos:

```ts
id: string
sku: string
name: string
category: string
price: number
quantity: number
createdAt: Date
updatedAt: Date
```

## WebSocket

O backend emite atualizações em tempo real para o frontend na seguinte conexão:

- Evento: `productsUpdated`

Quando um produto é criado, atualizado, removido ou importado, o servidor notifica todos os clientes conectados com a lista atualizada.

## Execução com Docker

O projeto também possui configuração de container no arquivo `docker-compose.yml` na raiz do workspace.

Para subir os serviços:

```bash
docker-compose up --build
```

Os serviços incluem:

- PostgreSQL
- Backend NestJS na porta 3000
- Frontend React na porta 80

## Observações importantes

- A aplicação usa `synchronize: true`, então a estrutura das tabelas pode ser criada automaticamente pelo TypeORM.
- A autenticação é simples e baseada em um usuário fixo para fins de testes.
- O backend habilita CORS para aceitar requisições do frontend.
- O acesso à API e ao frontend deve ser realizado com atenção ao token JWT em todas as rotas protegidas.

## Próximos passos sugeridos

- substituir autenticação fake por banco de usuários;
- externalizar credenciais para variáveis de ambiente;
- separar configuração de banco e JWT em arquivos `.env`;
- adicionar validação com class-validator nos DTOs;
- criar testes unitários para services e controllers.

## Autor

Projeto de backend do sistema de cadastro de produtos, desenvolvido em NestJS com foco em CRUD, autenticação, importação de dados e sincronização em tempo real.
