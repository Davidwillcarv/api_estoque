# Frontend - Cadastro de Produtos

Aplicação web em React para gerenciar produtos, realizar login, importar planilhas Excel e visualizar atualizações em tempo real vindas do backend NestJS.

## Visão geral

Este frontend foi desenvolvido para operar junto ao backend do sistema de cadastro de produtos. Ele permite:

- autenticação com JWT
- listar produtos em tabela
- cadastrar e editar itens
- excluir produtos
- buscar por nome ou SKU
- filtrar por categoria
- importar produtos em massa via Excel
- receber atualizações em tempo real por WebSocket

## Tecnologias utilizadas

- React 19
- Vite
- JavaScript
- Socket.IO Client
- XLSX
- Lucide React
- CSS moderno com classes utilitárias

## Estrutura do projeto

```text
frontend-produtos/
├── public/
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   ├── main.jsx
│   └── assets/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── eslint.config.js
├── Dockerfile
├── README.md
└── .gitignore
```

## Requisitos

- Node.js 20+
- npm
- Backend NestJS rodando em `http://localhost:3000`

## Como rodar localmente

1. Acesse a pasta do frontend:

```bash
cd frontend-produtos
```

2. Instale as dependências:

```bash
npm install
```

3. Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

4. A aplicação ficará disponível em:

```text
http://localhost:5173
```

## Login

A autenticação é feita diretamente no backend usando os dados abaixo:

- e-mail: `admin@admin.com`
- senha: `123456`

Se o backend não estiver disponível na porta 3000, a aplicação exibirá uma mensagem de erro de conexão.

## Funcionalidades

### Login

- Tela de autenticação com e-mail e senha
- Armazenamento do token JWT no `localStorage`
- Logout do sistema

### Dashboard de produtos

- total de produtos cadastrados
- valor total em estoque
- quantidade de categorias

### Listagem

- tabela com SKU, nome, categoria, preço e estoque
- busca por nome ou SKU
- filtro por categoria
- ações de editar e excluir

### Cadastro e edição

- formulário para criar ou atualizar produtos
- dados enviados ao backend em JSON
- atualização automática da listagem após salvar

### Importação de Excel

- seleção de arquivo `.xlsx`, `.xls` ou `.csv`
- envio para a rota `/products/import` do backend
- feedback visual de sucesso ou erro

### Atualização em tempo real

O frontend se conecta ao backend via Socket.IO e escuta o evento `productsUpdated`.

Quando um produto é alterado, criado, removido ou importado, a lista da tela é atualizada automaticamente sem recarregar a página.

## Endpoints consumidos pelo frontend

O frontend usa estas rotas do backend:

```text
POST /auth/login
GET /products
POST /products
PUT /products/:id
DELETE /products/:id
POST /products/import
```

## Variáveis e configuração

A aplicação usa a URL base da API em:

```js
const API_URL = "http://localhost:3000";
```

Se o backend estiver em outra porta ou host, ajuste esse valor em `src/App.jsx`.

## Scripts disponíveis

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Observações importantes

- a aplicação depende do backend estar rodando antes do login
- o token JWT deve ser enviado em todos os pedidos protegidos
- o projeto foi construído para uso em ambiente de desenvolvimento e demonstração
- a importação de arquivos envia os dados para o backend para processamento

## Próximos passos sugeridos

- externalizar a URL da API para variáveis de ambiente
- criar componentes separados para login, tabela e formulário
- adicionar validações mais robustas no frontend
- melhorar a gestão de estados com Context API ou Redux/Zustand
- aplicar testes de interface com React Testing Library

## Autor

Frontend do sistema de cadastro de produtos, integrado com API NestJS e sincronização em tempo real via WebSocket.
