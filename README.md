# Simplified E-commerce Backend

Technical test backend built as a NestJS monorepo with microservices, PostgreSQL, Docker, GitHub Actions, and a simple AWS deployment proposal.

## Architecture

- `api-gateway`: single HTTP entry point for clients.
- `products-service`: manages the product catalog.
- `orders-service`: creates and lists orders, validating products over HTTP.
- `postgres`: a single relational instance to keep local execution and deployment simple.

![Architecture Diagram](docs/diagrams/architecture-diagram.png)

This architecture keeps responsibilities clearly separated:

- `api-gateway` centralizes public access and routing.
- `products-service` owns product catalog operations.
- `orders-service` owns order creation and retrieval, including product validation.
- PostgreSQL provides simple relational persistence for both services.

This design is easy to explain in an interview because it balances scalability and simplicity:

- it supports independent evolution of product and order domains
- it keeps business logic isolated by service
- it is easy to run locally and easy to map to a cloud deployment

## Project structure

```text
.
├── apps
│   ├── api-gateway
│   │   ├── src
│   │   │   ├── common
│   │   │   ├── orders
│   │   │   ├── products
│   │   │   ├── app.module.ts
│   │   │   ├── health.controller.ts
│   │   │   └── main.ts
│   │   └── tsconfig.app.json
│   ├── orders-service
│   │   ├── src
│   │   │   ├── orders
│   │   │   ├── app.module.ts
│   │   │   ├── health.controller.ts
│   │   │   └── main.ts
│   │   └── tsconfig.app.json
│   └── products-service
│       ├── src
│       │   ├── products
│       │   ├── app.module.ts
│       │   ├── health.controller.ts
│       │   └── main.ts
│       └── tsconfig.app.json
├── deploy/aws/AWS_DEPLOYMENT.md
├── docker
│   ├── api-gateway.Dockerfile
│   ├── orders-service.Dockerfile
│   └── products-service.Dockerfile
├── .github/workflows
│   ├── products-service-ci.yml
│   └── release.yml
├── .env.example
├── .releaserc.json
├── docker-compose.yml
├── nest-cli.json
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

## Exposed endpoints

The available endpoints and API data models can be reviewed directly in the `api-gateway` Swagger UI:

- `http://localhost:3000/docs`

## Data model

![Entity Relationship Diagram](docs/diagrams/entity-relationship-diagram.png)

The most important relationships are:

- `catalog_products` stores the product catalog.
- `orders_orders` stores the order header.
- `orders_order_items` stores the items of each order and references its parent order.

## Order flow

![Order Creation Flow](docs/diagrams/order-creation-flow.png)

## Environment variables

Copy `.env.example` to `.env` if you want to customize the default values.

| Variable                           | Description                                                                   | Default value                                              |
| ---------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `NODE_ENV`                         | Runtime environment for the services                                          | `development`                                              |
| `POSTGRES_DB`                      | PostgreSQL database name                                                      | `ecommerce`                                                |
| `POSTGRES_USER`                    | PostgreSQL username                                                           | `ecommerce`                                                |
| `POSTGRES_PASSWORD`                | PostgreSQL password                                                           | `ecommerce`                                                |
| `POSTGRES_PORT`                    | Exposed PostgreSQL port                                                       | `5432`                                                     |
| `API_GATEWAY_PORT`                 | API Gateway HTTP port                                                         | `3000`                                                     |
| `API_GATEWAY_PRODUCTS_SERVICE_URL` | Internal `products-service` URL used by the gateway                           | `http://products-service:3001`                             |
| `API_GATEWAY_ORDERS_SERVICE_URL`   | Internal `orders-service` URL used by the gateway                             | `http://orders-service:3002`                               |
| `PRODUCTS_SERVICE_PORT`            | `products-service` HTTP port                                                  | `3001`                                                     |
| `PRODUCTS_DATABASE_URL`            | PostgreSQL connection string used by `products-service`                       | `postgresql://ecommerce:ecommerce@postgres:5432/ecommerce` |
| `ORDERS_SERVICE_PORT`              | `orders-service` HTTP port                                                    | `3002`                                                     |
| `ORDERS_DATABASE_URL`              | PostgreSQL connection string used by `orders-service`                         | `postgresql://ecommerce:ecommerce@postgres:5432/ecommerce` |
| `ORDERS_PRODUCTS_SERVICE_URL`      | Internal `products-service` URL used by `orders-service` to validate products | `http://products-service:3001`                             |

## Local execution with Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

Available services:

- API Gateway: `http://localhost:3000`
- Gateway Swagger: `http://localhost:3000/docs`
- Products Service: `http://localhost:3001`
- Products Swagger: `http://localhost:3001/docs`
- Orders Service: `http://localhost:3002`
- Orders Swagger: `http://localhost:3002/docs`

### Alternative option: local development without Docker

This option requires PostgreSQL to already be installed and running locally on `localhost:5432`.
Before starting the services, make sure you have:

- a database named `ecommerce`
- a user with credentials compatible with `postgresql://ecommerce:ecommerce@localhost:5432/ecommerce`
- permissions for both microservices to connect to that database

If you do not have a local PostgreSQL instance ready, the recommended option is still `docker compose up --build`.

```bash
pnpm install

# Terminal 1
export PORT=3001
export DATABASE_URL=postgresql://ecommerce:ecommerce@localhost:5432/ecommerce
pnpm start:dev:products-service

# Terminal 2
export PORT=3002
export DATABASE_URL=postgresql://ecommerce:ecommerce@localhost:5432/ecommerce
export PRODUCTS_SERVICE_URL=http://localhost:3001
pnpm start:dev:orders-service

# Terminal 3
export PORT=3000
export PRODUCTS_SERVICE_URL=http://localhost:3001
export ORDERS_SERVICE_URL=http://localhost:3002
pnpm start:dev:api-gateway
```

## Manual tests

List products:

```bash
curl http://localhost:3000/api/products
```

Create product:

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Headphones",
    "description": "Noise-cancelling over-ear headphones",
    "price": 149.99,
    "stock": 12
  }'
```

Create order:

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 2 },
      { "productId": 2, "quantity": 1 }
    ]
  }'
```

List orders:

```bash
curl http://localhost:3000/api/orders
```

## CI/CD

The project includes three GitHub Actions workflows:

### 1. General monorepo CI

File: `.github/workflows/ci.yml`

It runs on `push`, `pull_request`, and manual dispatch, and validates overall code quality:

- `pnpm check-format`
- `pnpm check-types`
- `pnpm lint`
- `docker compose config -q`
- `pnpm build`
- `pnpm test -- --passWithNoTests`

### 2. `products-service` specific CI

File: `.github/workflows/products-service-ci.yml`

It runs when changes affect `products-service` and adds validations closer to deployment:

- reproducible installation with `pnpm install --frozen-lockfile`
- format, type, and lint checks
- `products-service` build
- test execution
- startup of `postgres` and `products-service` with Docker Compose
- smoke test against `GET /health`
- Docker image build for the service

### 3. Automatic release

File: `.github/workflows/release.yml`

On `main`, it first runs a `verify` phase with:

- `pnpm check-format`
- `pnpm check-types`
- `pnpm lint`
- `pnpm test -- --passWithNoTests`
- `docker compose config -q`
- `pnpm build`

If everything passes, it runs `semantic-release` to:

- calculate the next version from Conventional Commits
- generate or update `CHANGELOG.md`
- create the GitHub release
- update the project version

## Simple AWS deployment

The proposal documented in [deploy/aws/AWS_DEPLOYMENT.md](deploy/aws/AWS_DEPLOYMENT.md) uses:

- AWS App Runner for each microservice
- Amazon RDS PostgreSQL as the database
- environment variables for service URLs and database connection
- a VPC Connector so App Runner can access private RDS

This keeps the topology realistic but simple, without EKS or complex Terraform.

## Requirements checklist

- Monorepo microservices architecture.
- Backend implemented with NestJS.
- Relational database: PostgreSQL.
- At least two microservices: `products-service` and `orders-service`.
- API Gateway: `api-gateway`.
- Local cloud-like execution with Docker: `docker-compose.yml`.
- Simple AWS deployment design: `deploy/aws/AWS_DEPLOYMENT.md`.
- CI/CD pipelines: `ci.yml`, `products-service-ci.yml`, and `release.yml`.
- Automatic versioning and changelog: `semantic-release`.
- README and deployment documentation: implemented.
- DTOs, validations, error handling, and REST principles: implemented.
- Small validation-focused tests: implemented.
- Swagger: included as a bonus.
