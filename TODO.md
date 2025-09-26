

## **To-Do: Desafio Técnico Fullstack + IA**
### unitários
 [X] - resolver bug de nao autorizado

### **1️⃣ Setup Inicial**

* [X] Criar repositório GitHub/GitLab
* [X] Inicializar projeto monorepo ou separado (backend / frontend / IA)
* [X] Configurar Dockerfile e docker-compose para ambiente local
* [X] Configurar ESLint / Prettier / Husky / lint-staged
* [ ] Criar README inicial com instruções de setup

---

### **2️⃣ Backend / API**

#### Autenticação

* [X] Implementar JWT ou OAuth2
* [X] Rota de login / registro / refresh token
* [X] Middleware de autenticação para rotas privadas

#### CRUD de Tarefas

* [X] Model de Tarefa (id, título, descrição, prioridade, status, timestamps)
* [X] Use Cases: `GET /tasks`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`
* [X] Tasks Controller and e2e tests
* [X] Auditoria mínima: criar/atualizar usuário + timestamp

#### Integração IA

* [X] Endpoint para geração automática de título e descrição
* [X] Endpoint para sugestão de prioridade
* [X] Endpoint para busca semântica (recebendo query de texto livre)
* [X] criar testes para todos os endpoint acima

#### Extras Backend

* [X] Logs de requisições e erros
* [X] Healthcheck `/health`
* [X] Paginação em listagem de tarefas
* [X] Índices no banco para otimizar busca

---

### **3️⃣ IA**

**Stack sugerida:** Python + FastAPI / Node + OpenAI API

#### Geração de Conteúdo

* [X] Função para gerar título resumido a partir do texto livre
* [X] Função para gerar descrição resumida
* [X] Cache simples de prompts/respostas

#### Priorização

* [X] Modelo para sugerir prioridade (urgência/impacto)
* [X] Retornar explicação curta da sugestão

#### Busca Semântica

* [X] Criar embeddings para tarefas
  -[X] Adicionar na hora de criar tarefas os embeddings e o novo schema prisma com os embeddings
* [X] Endpoint de busca por similaridade
* [X] Indexar novas tarefas automaticamente

---

### **4️⃣ Frontend / UI**

**Stack sugerida:** React + TypeScript + Tailwind

#### Autenticação

* [X] Tela de login / logout / refresh token
* [X] Guardas de rota para proteger páginas privadas

#### Dashboard de Tarefas

* [X] Listagem de tarefas com filtros e paginação
* [X] Cards ou tabela mostrando: título, descrição, prioridade, justificativa IA
* [X] Busca por texto (query para backend IA)
* [X] Formulário para criar / atualizar tarefas
* [X] Feedback visual das ações (loading, sucesso, erro)

---

### **5️⃣ Integração / Webhook**

* [X] Criar endpoint webhook que simula entrada de mensagens (tipo WhatsApp)
* [X] Transformar mensagem em tarefa usando IA (gerar título/descrição/prioridade)
* [X] Persistir tarefa no banco

---

### **6️⃣ Testes**

* [X] Testes unitários para funções do backend
* [X] Testes de integração da API (CRUD + IA)
* [ ] Testes de UI (cypress / react-testing-library)

---

### **7️⃣ DevEx / Ops**

* [ ] Docker Compose para backend + frontend + banco
* [X] Logs de aplicação (console + arquivo)
* [X] Paginação / performance / índices
* [ ] Configurar variáveis de ambiente seguras

---

### **8️⃣ Documentação**

* [X] Swagger ou Postman para API
* [ ] README explicando setup, rotas, IA, testes
* [ ] DECISIONS.md: decisões de arquitetura e bibliotecas

---

### **9️⃣ Bônus (Opcional)**

* [ ] CI/CD (GitHub Actions / GitLab CI)
* [ ] Feature flags (LaunchDarkly ou config simples)
* [ ] Rate limiting / retry em endpoints críticos
* [ ] Monitoramento básico (Prometheus / Grafana ou logs)
* [ ] RBAC simples (roles: admin / user)
