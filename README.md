# Serviço de Venda de Veículos

API NestJS + TypeORM + PostgreSQL responsável pelo cadastro de veículos e pelo fluxo de venda.
É um dos 2 microsserviços do desafio **Tech Challenge Fase 4 (Pós Tech SOAT)**: uma plataforma de
revenda de veículos automotores.

Este serviço é dono dos módulos **`vehicles`** e **`sales`**, com banco de dados isolado
(`car_sale`). O outro serviço do desafio ("core", repositório irmão) é dono de **usuários** e
**ordens de pagamento** e tem seu próprio banco isolado. Os dois se comunicam **apenas via HTTP**.

## Regras de negócio implementadas

- Cadastro de veículo para venda (marca, modelo, ano, cor, preço).
- Edição dos dados do veículo.
- Listagem de veículos à venda (`status = available`), ordenada por preço crescente.
- Listagem de veículos vendidos (`status = sold`), ordenada por preço crescente.
- Registro de venda com **CPF do comprador** (validado com o algoritmo padrão de dígito
  verificador) e data da venda.
- Ao registrar uma venda, o veículo fica **indisponível** para outras vendas imediatamente
  (`status = reserved`) até o pagamento ser confirmado ou cancelado pelo webhook do serviço core.

## Arquitetura e fluxo entre os serviços

```
Cliente
  │  POST /sales { vehicleId, buyerCpf, saleDate? }
  ▼
[car-sales] ── 1 transação de banco ──────────────────────────────┐
  │ 1. verifica se o veículo existe e está "available"            │
  │ 2. cria a Sale com status "pending_payment"                   │
  │ 3. marca o Vehicle como "reserved"                            │
  │ 4. HTTP POST PAYMENT_ORDER_SERVICE_URL { saleId, totalPrice } │──▶ [core] cria PaymentOrder
  │ 5. grava o paymentCode retornado na Sale e faz commit          │◀── { paymentCode }
  └──────────────────────────────────────────────────────────────┘
     (se qualquer etapa falhar, a transação inteira é revertida — o veículo continua disponível)

[gateway de pagamento] ──▶ PATCH /payment-order/webhook/:paymentCode (no core) { status }
                              core atualiza a PaymentOrder e chama de volta:
                              PATCH /sales/:id/payment-status { status }  (neste serviço)
                                status=completed → Sale=completed, Vehicle=sold
                                status=cancelled → Sale=cancelled, Vehicle=available (libera o veículo)
```

O preço da venda (`totalPrice`) **não** é enviado pelo cliente — é sempre derivado do
`vehicle.price` no momento da venda, para evitar que o preço seja forjado na requisição.

## Rotas da API

| Método | Rota                         | Descrição                                              |
|--------|------------------------------|---------------------------------------------------------|
| POST   | `/vehicles`                  | Cadastra um veículo                                      |
| GET    | `/vehicles`                  | Lista veículos (`?sortBy=price\|createdAt&sortAsc=`)     |
| GET    | `/vehicles/for-sale`         | Lista veículos à venda, por preço crescente              |
| GET    | `/vehicles/sold`             | Lista veículos vendidos, por preço crescente             |
| GET    | `/vehicles/:id`              | Busca um veículo por id                                  |
| PATCH  | `/vehicles/:id`               | Edita um veículo                                         |
| DELETE | `/vehicles/:id`               | Remove um veículo                                        |
| POST   | `/sales`                     | Registra uma venda (CPF do comprador + data)             |
| GET    | `/sales`                     | Lista vendas                                             |
| GET    | `/sales/:id`                 | Busca uma venda por id                                   |
| PATCH  | `/sales/:id`                  | Atualização genérica de uma venda                        |
| PATCH  | `/sales/:id/payment-status`   | Chamado pelo serviço core após o webhook de pagamento    |
| DELETE | `/sales/:id`                  | Remove uma venda                                         |
| GET    | `/health`                     | Healthcheck                                              |

Documentação interativa (Swagger) disponível em `/api/docs` após subir a aplicação.

## Variáveis de ambiente

Veja `.env.example`. Resumo:

| Variável                    | Descrição                                                                 |
|-----------------------------|----------------------------------------------------------------------------|
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | Conexão com o Postgres deste serviço (`car_sale`) |
| `PORT`                       | Porta HTTP da aplicação (padrão 3000)                                     |
| `PAYMENT_ORDER_SERVICE_URL`  | URL completa do endpoint `POST /payment-order` do serviço core            |

## Como rodar localmente

### Sozinho (sem o serviço core)

```bash
npm install
docker compose up -d postgres01
npm run migration:run
npm run start:dev
```

Sem `PAYMENT_ORDER_SERVICE_URL` configurada, `POST /sales` responde `503` na etapa de criação da
ordem de pagamento (o restante da API funciona normalmente).

### Junto com o serviço core (fluxo completo, para a demo)

Os dois `docker-compose.yml` (deste repositório e do repositório `core`) compartilham uma rede
Docker externa chamada `car-sales-net`, para que os containers das duas aplicações consigam se
chamar pelo nome do serviço.

```bash
docker network create car-sales-net   # uma única vez

# neste repositório
docker compose up -d --build

# no repositório core
docker compose up -d --build
```

Depois de os dois subirem, este serviço fica acessível em `http://localhost:3000` e o core em
`http://localhost:3000` do lado dele (mapeie portas diferentes no host se rodar os dois ao mesmo
tempo, ex. `3000` aqui e `3001` no core — ajuste `docker-compose.yml`/`.env` conforme necessário).

## Testes e cobertura

```bash
npm test            # suíte completa
npm run test:cov    # com relatório de cobertura (gate de 80% configurado no jest.coverageThreshold)
```

O comando `test:cov` falha automaticamente se qualquer métrica (statements, branches, functions,
lines) ficar abaixo de 80%.

## CI/CD

- `.github/workflows/ci.yml`: roda a suíte de testes com cobertura em todo push para `main`/`master`
  e em todo Pull Request.
- `.github/workflows/cd.yml`: em todo push para `main` (ou seja, após merge de um PR), builda a
  imagem Docker e publica em `ghcr.io/<owner>/<repo>` (tags `latest` e o SHA do commit).
