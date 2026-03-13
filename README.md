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


## DOCUMENTACAO - Elias Boaroli

## Tarefa 01 – Validacoes de Agendamento

Foram implementadas validacoes de negocio no fluxo de criacao/edicao de agendamentos, envolvendo backend (NestJS) e frontend (Angular).

### Backend (NestJS)

Arquivos principais:
- `server/src/modules/agendamentos/dto/create-agendamento.dto.ts`
- `server/src/modules/agendamentos/agendamentos.service.ts`

Implementacoes:

- **Data/hora no passado**:
  - Metodo privado `validateBusinessRules` em `AgendamentosService` verifica se `dataHora` é anterior ao momento atual.
  - Em caso invalido, lanca `BadRequestException('Nao é permitido agendar no passado.')`.

- **Duracao do agendamento**:
  - `duracaoMinutos` anotado com:
    - `@Min(15, { message: 'Duracao (minutos) deve ser no minimo 15.' })`
    - `@Max(240, { message: 'Duracao (minutos) deve ser no maximo 240.' })`
  - Garante duracao entre 15 e 240 minutos, com mensagens em portugues.

- **Valor do agendamento**:
  - No DTO, `valor` possui `@Min(0)` e `@Max(999999.99)` para impedir valores negativos.
  - Em `validateBusinessRules`, é validado que o valor tenha no maximo 2 casas decimais; caso contrario, lanca `BadRequestException('Valor deve ter no maximo 2 casas decimais.')`.

- **Integracao no fluxo**:
  - `validateBusinessRules` é chamado em `create` e `update`, retornando HTTP 400 com mensagens claras em caso de violacao.

### Frontend (Angular)

Arquivos principais:
- `web/src/app/pages/agendamentos-page.component.ts`
- `web/src/app/pages/agendamentos-page.component.html`

Implementacoes:

- **Validacoes no formulario reativo**:
  - `duracaoMinutos` com `Validators.min(15)` e `Validators.max(240)`.
  - `valor` com `Validators.min(0)`.

- **Tratamento e exibicao de erros**:
  - O metodo `save()` inspeciona `err.error.message` nas respostas de erro da API de agendamentos.
  - Mensagens vindas do backend sao agregadas e armazenadas em `error`.
  - `error` é exibido no topo da pagina e dentro da modal de criacao/edicao de agendamento, permitindo ao usuario entender o motivo do erro (por exemplo: data no passado, duracao fora da faixa ou valor invalido).

## Tarefa 02 – Filtros de Listagem (Agendamentos)

Foram implementados filtros de busca para a listagem de agendamentos, com suporte completo no backend (NestJS) e no frontend (Angular), mantendo o padrao REST da API.

### Backend (NestJS)

Arquivos principais:
- `server/src/modules/agendamentos/dto/filter-agendamento.dto.ts`
- `server/src/modules/agendamentos/agendamentos.controller.ts`
- `server/src/modules/agendamentos/agendamentos.service.ts`

Implementacoes:

- **DTO de filtros (`FilterAgendamentoDto`)**:
  - Propriedades opcionais mapeadas a partir da query string:
    - `clinicaId?: string`
    - `medicoId?: string`
    - `pacienteId?: string`
    - `dataInicio?: string` (ISO ou `yyyy-MM-dd`)
    - `dataFim?: string`
    - `pagou?: string` (`'true'` ou `'false'`)
  - Uso de `class-validator` para validacao basica (`@IsMongoId`, `@IsDateString`, `@IsBooleanString`, `@IsOptional`).

- **Controller (`AgendamentosController`)**:
  - Metodo `findAll` agora recebe filtros via query string:
    - `findAll(@Query() filters: FilterAgendamentoDto)`
    - Encaminha os filtros para o service: `this.agendamentosService.findAll(filters);`

- **Service (`AgendamentosService`)**:
  - Metodo `findAll(filters: FilterAgendamentoDto)` monta dinamicamente um objeto `query` para o Mongoose:
    - Filtros diretos:
      - `clinicaId`, `medicoId`, `pacienteId` → `query.clinicaId`, `query.medicoId`, `query.pacienteId`.
    - Filtro por periodo:
      - Se `dataInicio` ou `dataFim` informados, monta `query.dataHora` com `$gte`/`$lte` usando `new Date(...)`.
    - Filtro por pagamento:
      - Converte `filters.pagou` de `'true'`/`'false'` para booleano (`query.pagou = true/false`).
  - A consulta final é feita com:
    - `this.agendamentoModel.find(query).populate(...).sort({ dataHora: 1 }).exec();`

### Frontend (Angular)

Arquivos principais:
- `web/src/app/core/crud-api.service.ts`
- `web/src/app/pages/agendamentos-page.component.ts`
- `web/src/app/pages/agendamentos-page.component.html`

Implementacoes:

- **Servico de API generico (`CrudApiService`)**:
  - Metodo `list` passou a aceitar parametros opcionais de filtro:
    - `list(entity: EntityType, params?: Record<string, any>): Observable<any[]>`
  - Constrói `HttpParams` a partir de `params` e envia na chamada `GET`:
    - Ignora valores `undefined`, `null` ou string vazia.

- **Estado e logica de filtros na tela de agendamentos**:
  - Em `AgendamentosPageComponent` foi criado um `FormGroup` especifico para filtros:
    - `filtersForm` com campos: `clinicaId`, `medicoId`, `pacienteId`, `dataInicio`, `dataFim`, `pagou`.
  - Metodo privado `buildFilterParams()`:
    - Le os valores do `filtersForm`.
    - Monta um objeto `params` apenas com campos preenchidos.
    - Esse objeto é repassado ao servico de API.
  - Metodo `loadAll()`:
    - Continua carregando `clinicas`, `medicos` e `pacientes` normalmente.
    - Para agendamentos, agora faz `this.api.list('agendamentos', params)` usando os filtros atuais.
  - Metodos de acao:
    - `applyFilters()` chama `loadAll()` com o estado atual dos filtros.
    - `clearFilters()` reseta o `filtersForm` e recarrega a listagem sem filtros.

- **Barra de filtros na interface**:
  - Em `agendamentos-page.component.html` foi adicionada uma barra de filtros acima do calendario:
    - Selects para Clinica, Medico e Paciente.
    - Campos de `Data inicio` e `Data fim`.
    - Select de `Pagamento` (Todos, Pagos, Nao pagos).
    - Botoes "Aplicar" e "Limpar".
  - Os filtros sao aplicados sem recarregar a pagina, atualizando apenas a listagem de agendamentos.
  - Ao alternar entre visualizacao Mes/Dia, o `filtersForm` nao é resetado, de modo que os filtros permanecem ativos.

### Resultado da tarefa

- A API de agendamentos suporta filtros por clinica, medico, paciente, periodo e status de pagamento.
- A tela de agendamentos permite ao usuario selecionar filtros em uma barra dedicada, aplicar/limpar filtros dinamicamente e manter os filtros ativos ao alternar visualizacoes.



## Tarefa 03 – Dashboard de Indicadores

Foi criado um painel de indicadores operacionais de agendamentos, com cálculo de métricas no backend e visualização dedicada no frontend.

### Backend (NestJS)

Arquivos principais:
- `server/src/modules/agendamentos/dto/dashboard-agendamento.dto.ts`
- `server/src/modules/agendamentos/agendamentos.controller.ts`
- `server/src/modules/agendamentos/agendamentos.service.ts`

Implementações:

- **DTO de filtro de período (`DashboardAgendamentoDto`)**:
  - Campos opcionais:
    - `dataInicio?: string`
    - `dataFim?: string`
  - Usado para filtrar os indicadores por intervalo de datas via query string.

- **Endpoint de dashboard**:
  - Rota: `GET /agendamentos/dashboard`
  - Controller: método `getDashboard(@Query() filtro: DashboardAgendamentoDto)`
    - Encaminha para `AgendamentosService.getDashboard(filtro)`.

- **Cálculo dos indicadores (`getDashboard`)**:
  - Usa `aggregate` do Mongoose com um estágio `$match` por `dataHora` quando `dataInicio`/`dataFim` são informados.
  - Métricas calculadas:
    - `totalAgendamentos`: quantidade de agendamentos no período.
    - `valorTotalRecebido`: soma de `valor` dos registros com `pagou = true`.
    - `valorPendente`: soma de `valor` dos registros com `pagou = false`.
  - Indicadores por entidade:
    - **Total por clínica**:
    - **Total por médico**:

- **Contrato de resposta**:
  - Objeto com:
    - `totalAgendamentos`
    - `valorTotalRecebido`
    - `valorPendente`
    - `totalPorClinica: Array<{ clinicaId, nomeClinica, total, valor }>`
    - `totalPorMedico: Array<{ medicoId, nomeMedico, total, valor }>`

Todos os cálculos são realizados no backend; o frontend apenas consome e exibe os dados.

### Frontend (Angular)

Arquivos principais:
- `web/src/app/core/crud-api.service.ts`
- `web/src/app/pages/dashboard-page.component.ts`
- `web/src/app/pages/dashboard-page.component.html`
- `web/src/app/pages/dashboard-page.component.scss`
- `web/src/app/app.routes.ts`
- `web/src/app/app.component.html`

Implementações:

- **Serviço de API (`CrudApiService`)**:
  - Método `getAgendamentosDashboard(params?: Record<string, any>)`:
    - Monta `HttpParams` a partir de `params`.
    - Chama `GET {apiUrl}/agendamentos/dashboard`.

- **Componente de dashboard (`DashboardPageComponent`)**:
  - Standalone component com:
    - `filtroForm` para `dataInicio` e `dataFim`.
    - Signals `loading`, `error` e `indicadores`.
    - Interface `DashboardIndicadores` alinhada ao JSON de resposta.
  - Método `loadIndicadores()`:
    - Lê o período do `filtroForm`.
    - Chama `CrudApiService.getAgendamentosDashboard` passando os parâmetros.
    - Atualiza o signal `indicadores` com o resultado.
  - Método `limparFiltro()`:
    - Reseta o formulário e recarrega os indicadores sem filtro.
  - Formatação de valores monetários via método `formatCurrency`.

- **Template do dashboard**:
  - Barra de filtros por período (data inicial e final) com botões **Aplicar** e **Limpar**.
  - Cards de destaque:
    - Total de agendamentos.
    - Valor total recebido.
    - Valor pendente.
  - Tabelas resumo:
    - **Total por clínica**:
      - Colunas: `Clinica`, `Qtde`, `Valor`.
      - Exibe `nomeClinica` quando disponível, caindo para `clinicaId` como fallback.
    - **Total por médico**:
      - Colunas: `Medico`, `Qtde`, `Valor`.
      - Exibe `nomeMedico` ou `medicoId` como fallback.
  - Mensagens de estado:
    - “Carregando indicadores…” durante a requisição.
    - Aviso de “Sem dados para o período selecionado” quando não houver registros.

- **Navegação**:
  - Rota `/dashboard` adicionada em `app.routes.ts`.
  - Item “Dashboard” incluído no menu lateral (`app.component.html`) com `routerLink="/dashboard"`.

### Resultado da tarefa

- O sistema oferece um **dashboard operacional de agendamentos** com métricas por período:
  - Contagem total de agendamentos.
  - Valores financeiros recebidos e pendentes.
  - Quebra por clínica e por médico.
- O usuário consegue **filtrar por período** de forma dinâmica, com cálculos sempre sendo feitos no backend.
- A tela de dashboard apresenta as informações em formato de **cards e tabelas**, acessível diretamente pelo menu lateral da aplicação.