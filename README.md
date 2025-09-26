
# Leggal - Projeto NestJS com Prisma, Redis e Integração com IA

Este é o repositório do projeto **Leggal**, desenvolvido com **NestJS**, **Prisma**, **PostgreSQL** e **Redis**, com integração de **IA via OpenAI**.

---

## Pré-requisitos

* **Node.js 22**
* **Docker** e **Docker Compose**
* **pnpm** instalado globalmente

---

## Setup do Projeto

1. **Subir os bancos de dados com Docker Compose**

```bash
docker-compose up postgres cache -d
```

Isso vai iniciar os containers do **PostgreSQL** e do **Redis** do projeto.

---

2. **Instalar dependências**

```bash
pnpm install
```

---

3. **Rodar migrations do Prisma**

```bash
pnpm prisma migrate dev
```

Isso vai criar as tabelas do banco de dados conforme o schema definido.

---

4. **Rodar o projeto em modo de desenvolvimento**

```bash
pnpm start:dev
```

O projeto estará disponível na porta configurada (por padrão `3333`).

---

## Swagger

A documentação da API está disponível via **Swagger** em:

```
http://localhost:3333/api
```

---

## Rotas da API

### Usuários

* **POST /accounts** – criar conta do usuário

### Autenticação

* **POST /sessions** – autenticar usuário
* **POST /sessions/refresh** – renovar token de autenticação

### Tarefas (Tasks)

* **POST /tasks** – criar nova tarefa
* **GET /tasks** – listar tarefas do usuário autenticado
* **PATCH /tasks/:id** – editar tarefa por ID
* **DELETE /tasks/:id** – deletar tarefa por ID
* **POST /tasks/generate** – gerar tarefa via texto
* **POST /tasks/suggest-priority** – sugerir prioridade de uma tarefa
* **POST /tasks/semantic-search** – buscar tarefas semanticamente similares

### Health

* **GET /health** – verificar se o projeto está rodando

---

## Motivo da utilização do NestJS

O NestJS foi escolhido em comparação a outros frameworks de backend para Node.js por:

* Estrutura modular que facilita organização e manutenção do código
* Suporte nativo a TypeScript
* Integração simples com bancos de dados via Prisma
* Fácil integração com ferramentas de teste e documentação de APIs (Swagger)
* Suporte a injeção de dependência e arquitetura escalável

---

## Integração com IA

* Foi utilizada a **API da OpenAI** para gerar tarefas e sugerir prioridades automaticamente, trazendo inteligência para a aplicação.

---

## Testes

* Foram realizados **testes unitários** e **E2E**, garantindo que funcionalidades críticas da aplicação (usuários, tarefas e integração com IA) funcionem corretamente.
* Os testes recriam partes da aplicação para validar os fluxos de forma isolada.

---

## Arquitetura

* **Monolítica**: todos os serviços (usuários, tarefas, autenticação) estão concentrados em um único serviço, garantindo simplicidade no deploy e integração direta entre módulos.

---

## Scripts Úteis

| Comando                   | Descrição                                               |
| ------------------------- | ------------------------------------------------------- |
| `pnpm start:dev`          | Inicia o projeto em modo desenvolvimento com hot reload |
| `pnpm prisma migrate dev` | Executa as migrations do Prisma                         |
| `pnpm build`              | Gera a build do projeto NestJS                          |
| `pnpm lint`               | Checa o código com o Biome                              |
| `pnpm test`               | Executa os testes do projeto                            |

---

## Observações

* Certifique-se de que os containers do **Postgres** e do **Redis** estejam rodando antes de iniciar o projeto.
* Todas as variáveis de ambiente necessárias devem estar configuradas no arquivo `.env`. 
  - Veja o env-example
