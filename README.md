# Orca Swap — Automated Solana Whirlpool Trading Microservice

<p align="left">
  <img src="https://img.shields.io/badge/NestJS-10.x-E0234E?logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Solana-Web3.js-14F195?logo=solana&logoColor=black" alt="Solana" />
  <img src="https://img.shields.io/badge/Orca-Whirlpools-00D2D3" alt="Orca Whirlpools" />
  <img src="https://img.shields.io/badge/Deployment-Vercel%20Serverless-000000?logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" />
</p>

A production-ready **NestJS** REST API microservice for automated token trading and swaps on the **Orca Whirlpool** protocol (Concentrated Liquidity AMM) on the **Solana** blockchain. Designed for high throughput, algorithmic trading bots, and Web3 integrations with native support for both standalone Node.js runtimes and serverless deployment on **Vercel**.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture & Directory Structure](#-architecture--directory-structure)
- [Prerequisites & Installation](#-prerequisites--installation)
- [Configuration (.env)](#-configuration-env)
- [Running the Application](#-running-the-application)
- [API Reference](#-api-reference)
  - [1. Health Check (`GET /`)](#1-health-check-get-)
  - [2. Buy Token (`POST /buy`)](#2-buy-token-post-buy)
  - [3. Sell Token (`POST /sell`)](#3-sell-token-post-sell)
- [Security Advisory](#-security-advisory)
- [Credits & Contact](#-credits--contact)
- [License](#-license)

---

## 📖 Overview

**Orca Swap** abstracts complex on-chain Solana DEX operations into straightforward HTTP endpoints. It manages Program Derived Addresses (PDAs), Whirlpool tick indexing, price boundaries (`MIN_SQRT_PRICE`, `MAX_SQRT_PRICE`), and transaction orchestration directly against the official Orca Whirlpool program (`whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc`).

### Why Orca Swap?
- **Concentrated Liquidity Precision**: Leverages Orca's Whirlpools for minimal slippage and superior capital efficiency.
- **Microservice Decoupling**: Offload Solana transaction composition and key handling to a dedicated API layer.
- **Automated SDK Patching**: Bundled with `patch-package` to extend `@orca-so/sdk` definitions for custom devnet/mainnet liquidity pools without manual library rebuilds.
- **Serverless & Container Ready**: Out-of-the-box configuration for Vercel Serverless Functions (`vercel.json`) and containerized Node.js workloads.

---

## ⚡ Key Features

- **Bi-Directional Swaps**:
  - `POST /buy`: Executes Token B (e.g., USDC) to Token A (e.g., LMF Token) swaps (`aToB = false`).
  - `POST /sell`: Executes Token A (e.g., LMF Token) to Token B (e.g., USDC) swaps (`aToB = true`).
- **Granular Execution Controls**: Override pool addresses, RPC cluster endpoints, token decimals, and associated token accounts dynamically per request.
- **Zero Hardcoded Secrets**: Fully decoupled environment configuration with sensible fallbacks and strict payload validation.
- **Automated Health Monitoring**: Built-in health check endpoint for uptime checkers, load balancers, and Kubernetes probes.

---

## 🛠 Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend Framework** | [NestJS 10](https://nestjs.com/) | Enterprise-grade modular architecture and dependency injection |
| **Language & Runtime** | [TypeScript 5](https://www.typescriptlang.org/) / Node.js 18+ | Strict type safety, clean interfaces, and modern async handling |
| **Blockchain SDK** | [@solana/web3.js](https://solana-labs.github.io/solana-web3.js/) | Solana RPC connection, keypair derivation, and transaction submission |
| **DEX / AMM SDKs** | [@orca-so/whirlpools-sdk](https://www.orca.so/), [@orca-so/sdk](https://www.npmjs.com/package/@orca-so/sdk) | Whirlpool client, instruction builders (`WhirlpoolIx.swapIx`), PDA utilities |
| **Math & Encoding** | `decimal.js`, `@scure/base`, `@coral-xyz/anchor` | Precise token decimal arithmetic and Base58 cryptographic decoding |
| **Tooling & Patching** | `patch-package`, `postinstall-postinstall` | Applies custom pool and token definitions to `@orca-so/sdk` post-install |
| **Testing** | [Jest](https://jestjs.io/), [Supertest](https://github.com/ladjs/supertest) | End-to-end (E2E) and unit test coverage |
| **Deployment** | [Vercel](https://vercel.com/) (`@vercel/node`) | Zero-configuration serverless function routing |

---

## 📁 Architecture & Directory Structure

```text
orca-swap/
├── patches/
│   └── @orca-so+sdk+1.2.26.patch   # Automated SDK patch for custom Whirlpool pool definitions
├── src/
│   ├── interfaces/
│   │   └── ITradeBody.ts           # TypeScript interface for buy/sell payload contracts
│   ├── app.controller.spec.ts      # Unit tests for route controllers
│   ├── app.controller.ts           # REST route definitions (GET /, POST /buy, POST /sell)
│   ├── app.module.ts               # Root application module
│   ├── app.service.ts              # Core Whirlpool transaction building & execution
│   └── main.ts                     # Application bootstrap, CORS, and port configuration
├── test/
│   ├── app.e2e-spec.ts             # End-to-end integration tests
│   └── jest-e2e.json               # E2E test configuration
├── .env.example                    # Template for environment variables
├── .eslintrc.js                    # ESLint configuration
├── .gitignore                      # Git exclusion rules
├── nest-cli.json                   # NestJS CLI configuration
├── package.json                    # Project scripts and dependencies
├── tsconfig.json                   # TypeScript compiler options
├── vercel.json                     # Vercel serverless routing rewrite rules
└── yarn.lock                       # Deterministic package dependency lockfile
```

---

## ⚙️ Prerequisites & Installation

### 1. Prerequisites
- **Node.js**: Version `>= 18.x` (Node 20+ LTS recommended)
- **Package Manager**: [Yarn](https://classic.yarnpkg.com/en/) (`yarn install`) or `npm` / `pnpm`

### 2. Install Dependencies
Run the install command from the root of the repository. The `postinstall` hook will automatically execute `patch-package` to apply necessary fixes to `@orca-so/sdk`:

```bash
yarn install
```

Verify that the patch was applied successfully:
```text
patch-package 8.0.0
Applying patches...
@orca-so/sdk@1.2.26 ✔
```

---

## ⚙️ Configuration (.env)

Duplicate `.env.example` to create your local `.env` file:

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | `3000` | Port on which the HTTP server will listen |
| `SOLANA_CLUSTER` | Optional | `https://api.mainnet-beta.solana.com` | Default Solana RPC endpoint (recommend dedicated RPCs: Helius, Triton, QuickNode) |
| `DEFAULT_POOL_ADDRESS` | Optional | `8Mt3QbGAn7x3BowDrDiFmXJbsmzY8mpQ5jNw8BqX5GWc` | Fallback Whirlpool pool address when omitted in payload |
| `DEFAULT_TOKEN_A_OWNER`| Optional | *(empty)* | Fallback associated token account for Token A |
| `DEFAULT_TOKEN_B_OWNER`| Optional | *(empty)* | Fallback associated token account for Token B |

---

## 🚀 Running the Application

### Development Mode
Runs the application with hot module reloading:
```bash
yarn start:dev
```

### Production Build
Compile TypeScript into optimized JavaScript in `dist/`:
```bash
yarn build
yarn start:prod
```

### Automated Testing
Execute unit and E2E integration suites:
```bash
# Run unit tests
yarn test

# Run end-to-end tests
yarn test:e2e
```

### Deploying to Vercel
1. Install the Vercel CLI: `npm install -g vercel`
2. Authenticate and deploy:
   ```bash
   vercel
   ```
3. Add any required environment variables (e.g., `SOLANA_CLUSTER`) under **Project Settings > Environment Variables** in the Vercel Dashboard.

---

## 📚 API Reference

Default local base URL: `http://localhost:3000`  
*(Or your production Vercel deployment URL: `https://<your-project>.vercel.app`)*

---

### 1. Health Check (`GET /`)

Validates service availability and container responsiveness.

- **Method**: `GET`
- **Path**: `/`
- **Response**: `200 OK`
- **Output**: `HELLO !`

---

### 2. Buy Token (`POST /buy`)

Swaps **Token B** (input, e.g., USDC) for **Token A** (output, e.g., LMF).  
*On-chain parameter: `aToB = false`, `sqrtPriceLimit = MAX_SQRT_PRICE`.*

- **Method**: `POST`
- **Path**: `/buy`
- **Headers**: `Content-Type: application/json`

#### Request Body Schema
| Field | Type | Required | Description |
| :--- | :---: | :---: | :--- |
| `amount` | `number` | **Yes** | Input quantity of Token B to swap (e.g., `0.3`) |
| `secretKey` | `string` | **Yes** | Base58-encoded private key of the trading wallet |
| `tokenOwnerAccountA` | `string` | Optional* | Destination Token Account address for Token A (*required if `DEFAULT_TOKEN_A_OWNER` not set*) |
| `tokenOwnerAccountB` | `string` | Optional* | Source Token Account address for Token B (*required if `DEFAULT_TOKEN_B_OWNER` not set*) |
| `pool` | `string` | Optional | Whirlpool pool address (defaults to `DEFAULT_POOL_ADDRESS`) |
| `amountDecimal` | `number` | Optional | Decimals for Token B input (defaults to `6`) |
| `cluster` | `string` | Optional | Solana RPC cluster URL (defaults to `SOLANA_CLUSTER`) |

#### Example Request
```bash
curl -X POST http://localhost:3000/buy \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 0.3,
    "amountDecimal": 6,
    "tokenOwnerAccountA": "<RECIPIENT_TOKEN_A_ACCOUNT>",
    "tokenOwnerAccountB": "<SOURCE_TOKEN_B_ACCOUNT>",
    "secretKey": "<YOUR_WALLET_BASE58_SECRET_KEY>",
    "pool": "8Mt3QbGAn7x3BowDrDiFmXJbsmzY8mpQ5jNw8BqX5GWc",
    "cluster": "https://api.mainnet-beta.solana.com"
  }'
```

#### Successful Response (`200 OK`)
```json
{
  "txId": "5KtPn8oU2qM7F1V3X7gW8ZJ8hF9aKbX4vLmQ1cW2sZ5pY8..."
}
```

---

### 3. Sell Token (`POST /sell`)

Swaps **Token A** (input, e.g., LMF) for **Token B** (output, e.g., USDC).  
*On-chain parameter: `aToB = true`, `sqrtPriceLimit = MIN_SQRT_PRICE`.*

- **Method**: `POST`
- **Path**: `/sell`
- **Headers**: `Content-Type: application/json`

#### Request Body Schema
| Field | Type | Required | Description |
| :--- | :---: | :---: | :--- |
| `amount` | `number` | **Yes** | Input quantity of Token A to swap (e.g., `100.0`) |
| `secretKey` | `string` | **Yes** | Base58-encoded private key of the trading wallet |
| `tokenOwnerAccountA` | `string` | Optional* | Source Token Account address for Token A (*required if `DEFAULT_TOKEN_A_OWNER` not set*) |
| `tokenOwnerAccountB` | `string` | Optional* | Destination Token Account address for Token B (*required if `DEFAULT_TOKEN_B_OWNER` not set*) |
| `pool` | `string` | Optional | Whirlpool pool address (defaults to `DEFAULT_POOL_ADDRESS`) |
| `amountDecimal` | `number` | Optional | Decimals for Token A input (defaults to `9`) |
| `cluster` | `string` | Optional | Solana RPC cluster URL (defaults to `SOLANA_CLUSTER`) |

#### Example Request
```bash
curl -X POST http://localhost:3000/sell \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.0,
    "amountDecimal": 9,
    "tokenOwnerAccountA": "<SOURCE_TOKEN_A_ACCOUNT>",
    "tokenOwnerAccountB": "<RECIPIENT_TOKEN_B_ACCOUNT>",
    "secretKey": "<YOUR_WALLET_BASE58_SECRET_KEY>",
    "pool": "8Mt3QbGAn7x3BowDrDiFmXJbsmzY8mpQ5jNw8BqX5GWc",
    "cluster": "https://api.mainnet-beta.solana.com"
  }'
```

#### Successful Response (`200 OK`)
```json
{
  "txId": "3Y4zKm9ReV7pQt8aX1cW2sZ5pY8hF9aKbX4vLmQ1cW2sZ..."
}
```

---

## 🔒 Security Advisory

> [!WARNING]
> **CRITICAL SECURITY NOTICE CONCERNING PRIVATE KEYS**
>
> 1. **Never Commit Private Keys**: Under no circumstances should real private keys be hardcoded or checked into source control.
> 2. **Transport Layer Exposure**: The `/buy` and `/sell` endpoints accept a raw `secretKey` in the JSON request body. Exposing this service directly to the public internet without an authentication layer creates severe security risks.
> 3. **Production Recommendations**:
>    - **Private VPC / Internal Microservice**: Restrict service access exclusively to internal services within a private network or VPC subnet.
>    - **Access Control**: Enforce API Key / Bearer Token authorization, IP whitelisting, and strict rate-limiting on reverse proxies.
>    - **Key Vaulting**: For automated bots, consider deriving keys via hardware security modules (HSM) or cloud KMS (AWS KMS, GCP KMS, HashiCorp Vault).
>    - **Client-Side Signing**: For user-facing decentralized apps, construct unsigned transactions on the server and sign them on the client using a standard Solana Wallet Adapter.

---

## 🤝 Credits & Contact

- **Author**: **Nhat Tran**
- **Website**: [nhattran.dev](https://nhattran.dev)
- **Contact**: [contact@nhattran.dev](mailto:contact@nhattran.dev)
- **Protocol & Ecosystem Acknowledgments**:
  - [Orca](https://www.orca.so/) — For building the premier Concentrated Liquidity AMM on Solana and open-sourcing the Whirlpool SDKs.
  - [Solana Labs](https://solana.com/) — High-speed, low-latency Layer 1 blockchain infrastructure.
  - [NestJS](https://nestjs.com/) — Progressive TypeScript backend framework.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — see the LICENSE file for details.
