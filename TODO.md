
## **To-Do: Desafio Técnico Fullstack + IA**

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

* [ ] Model de Tarefa (id, título, descrição, prioridade, status, timestamps)
* [ ] Endpoints: `GET /tasks`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`
* [ ] Auditoria mínima: criar/atualizar usuário + timestamp

#### Integração IA

* [ ] Endpoint para geração automática de título e descrição
* [ ] Endpoint para sugestão de prioridade
* [ ] Endpoint para busca semântica (recebendo query de texto livre)

#### Extras Backend

* [ ] Logs de requisições e erros
* [ ] Healthcheck `/health`
* [ ] Paginação em listagem de tarefas
* [ ] Índices no banco para otimizar busca

---

### **3️⃣ IA**

**Stack sugerida:** Python + FastAPI / Node + OpenAI API

#### Geração de Conteúdo

* [ ] Função para gerar título resumido a partir do texto livre
* [ ] Função para gerar descrição resumida
* [ ] Cache simples de prompts/respostas

#### Priorização

* [ ] Modelo para sugerir prioridade (urgência/impacto)
* [ ] Retornar explicação curta da sugestão

#### Busca Semântica

* [ ] Criar embeddings para tarefas
* [ ] Endpoint de busca por similaridade
* [ ] Indexar novas tarefas automaticamente

---

### **4️⃣ Frontend / UI**

**Stack sugerida:** React + TypeScript + Tailwind

#### Autenticação

* [ ] Tela de login / logout / refresh token
* [ ] Guardas de rota para proteger páginas privadas

#### Dashboard de Tarefas

* [ ] Listagem de tarefas com filtros e paginação
* [ ] Cards ou tabela mostrando: título, descrição, prioridade, justificativa IA
* [ ] Busca por texto (query para backend IA)
* [ ] Formulário para criar / atualizar tarefas
* [ ] Feedback visual das ações (loading, sucesso, erro)

---

### **5️⃣ Integração / Webhook**

* [ ] Criar endpoint webhook que simula entrada de mensagens (tipo WhatsApp)
* [ ] Transformar mensagem em tarefa usando IA (gerar título/descrição/prioridade)
* [ ] Persistir tarefa no banco

---

### **6️⃣ Testes**

* [ ] Testes unitários para funções do backend
* [ ] Testes de integração da API (CRUD + IA)
* [ ] Testes de UI (cypress / react-testing-library)

---

### **7️⃣ DevEx / Ops**

* [ ] Docker Compose para backend + frontend + banco
* [ ] Logs de aplicação (console + arquivo)
* [ ] Paginação / performance / índices
* [ ] Configurar variáveis de ambiente seguras

---

### **8️⃣ Documentação**

* [ ] Swagger ou Postman para API
* [ ] README explicando setup, rotas, IA, testes
* [ ] DECISIONS.md: decisões de arquitetura e bibliotecas

---

### **9️⃣ Bônus (Opcional)**

* [ ] CI/CD (GitHub Actions / GitLab CI)
* [ ] Feature flags (LaunchDarkly ou config simples)
* [ ] Rate limiting / retry em endpoints críticos
* [ ] Monitoramento básico (Prometheus / Grafana ou logs)
* [ ] RBAC simples (roles: admin / user)
