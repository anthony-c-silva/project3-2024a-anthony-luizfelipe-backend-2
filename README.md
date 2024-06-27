# Controle de Estoque para Abrigos

Este projeto é um sistema de controle de estoque para abrigos, desenvolvido em Node.js utilizando Express e Sequelize para interação com um banco de dados PostgreSQL.

## Índice

- [Instalação](#instalação)
- [Configuração](#configuração)
- [Endpoints](#endpoints)
  - [Abrigos](#abrigos)
  - [Itens](#itens)
  - [Usuários](#usuários)
  - [Doações](#doações)
- [Execução](#execução)
- [Contribuição](#contribuição)
- [Licença](#licença)

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/project3-2024a-anthony-luizfelipe-backend-2.git
   cd project3-2024a-anthony-luizfelipe-backend

2. Instale as dependências:
   
    ```
   npm install
## Configuração 

1. Configure um arquivo .env com suas credenciais do PostgreSQL em formato URL:

    ```
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/controle-estoque?schema=public"
    ```

3. Certifique-se de que o banco de dados PostgreSQL esteja rodando e que as tabelas sejam criadas automaticamente quando a aplicação iniciar.

## Endpoints

### Abrigos

- **POST /abrigos**
  - Criar um novo abrigo
  - Body:
    ```json
    {
        "nome": "Abrigo A",
        "endereco": "Cidade A"
    }
    ```

- **GET /abrigos**
  - Obter todos os abrigos

- **GET /abrigos/:id**
  - Obter um abrigo pelo ID

- **PUT /abrigos/:id**
  - Atualizar um abrigo pelo ID
  - Body:
    ```json
    {
        "nome": "Abrigo Atualizado",
        "endereco": "Nova Localização"
    }
    ```

- **DELETE /abrigos/:id**
  - Deletar um abrigo pelo ID

### Itens

- **POST /itens**
  - Criar um novo item
  - Body:
    ```json
    {
        "nome": "Item 1",
        "quantidade": 10,
        "categoria": "Categoria 1",
        "abrigoId": 1
    }
    ```

- **GET /itens**
  - Obter todos os itens

- **GET /itens/:id**
  - Obter um item pelo ID

- **PUT /itens/:id**
  - Atualizar um item pelo ID
  - Body:
    ```json
    {
        "nome": "Item Atualizado",
        "quantidade": 20,
        "categoria": "Nova Categoria",
        "abrigoId": 1
    }
    ```

- **DELETE /itens/:id**
  - Deletar um item pelo ID

### Usuários

- **POST /usuarios**
  - Criar um novo usuário
  - Body:
    ```json
    {
        "nomeUsuario": "usuario1",
        "senha": "senha1",
        "email": "usuario1@example.com",
        "abrigoId": 1
    }
    ```

- **GET /usuarios**
  - Obter todos os usuários

- **GET /usuarios/:id**
  - Obter um usuário pelo ID

- **PUT /usuarios/:id**
  - Atualizar um usuário pelo ID
  - Body:
    ```json
    {
        "nomeUsuario": "usuarioAtualizado",
        "senha": "novaSenha",
        "email": "usuarioAtualizado@example.com",
        "abrigoId": 1
    }
    ```

- **DELETE /usuarios/:id**
  - Deletar um usuário pelo ID

### Doações

- **POST /doacoes**
  - Criar uma nova doação
  - Body:
    ```json
    {
        "quantidade": 5,
        "date": "2024-06-05T10:00:00.000Z",
        "itemId": 1
    }
    ```

- **GET /doacoes**
  - Obter todas as doações

- **GET /doacoes/:id**
  - Obter uma doação pelo ID

- **PUT /doacoes/:id**
  - Atualizar uma doação pelo ID
  - Body:
    ```json
    {
        "quantidade": 10,
        "data": "2024-06-06T11:00:00.000Z",
        "itemId": 1
    }
    ```

- **DELETE /doacoes/:id**
  - Deletar uma doação pelo ID

## Execução

1. Inicie o servidor:
   ```bash
   npm run dev




