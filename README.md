# Opencurve Capital – Vault Architecture (ERC-4626 Standard)

This repository contains a demonstration of the **Opencurve Capital** vault architecture, designed around the [ERC-4626](https://eips.ethereum.org/EIPS/eip-4626) standard for yield-bearing vaults. It illustrates how Opencurve products are built — using composable, secure, and modular smart contract infrastructure.

This repo includes a minimal working prototype of a Stablecoin Yield Vault using a simplified strategy (DAI → Compound), modeled after Yearn V2 vault patterns but updated to the ERC-4626 interface and controller separation logic.

> ⚠️ Note: This repository is for demonstration and technical diligence purposes only. The actual Opencurve vaults used in production deployments will include enhanced controls, whitelisting mechanisms, and strategy connectors for multiple yield sources.

---

## 🧭 About Opencurve

**Opencurve Capital** builds on-chain-native aggregated products that access yield via stable strategies, token market liquidity, and blockchain infrastructure, while delivering ecosystem value.

We design and operate structured on-chain products that:
- Generate yield for via battle-tested DeFi strategies
- Provide liquidity infrastructure for emerging tokens
- Monetize protocol infrastructure (e.g., validator nodes)

Our vault architecture enables permissioned capital deployment, strategy whitelisting, and composable product design across Ethereum and Polkadot ecosystems.

---

## 🔧 What This Repo Shows

This prototype showcases a simplified version of our vault stack, using:
- **ERC-4626 Vault Contract**
- **Controller**: delegates capital to strategy contracts
- **Strategy**: a demo integration with Compound (DAI lending)

This forms the foundational pattern for Opencurve vaults:
- **Stablecoin Vaults** → Yield via Pendle, Curve, Spark, etc.
- **Market Making Vaults** → Liquidity provision on-chain, hybridized with CEX operations (off-chain)
- **Infrastructure Vaults** → Capital allocation into validator licenses

---

## 🛡️ Features in Production Deployments

The actual Opencurve vaults include the follwoing beyond the features in this demo:

### ✅ LP Access Control
- Only whitelisted wallet addresses can deposit.

### ✅ Protocol Whitelisting
- Strategies may only interact with approved protocols or pools, ensuring security and preventing misuse.

### 🔄 Strategy Composability
- Strategies are modular adapters — Pendle, Spark, Ethena, Curve, etc., each implemented as pluggable components.

## 📚 References

- **ERC-4626 Spec**: ethereum/EIPs #4626

- **Yearn V2 Contracts**: yearn/yearn-starter-pack

- **Solmate Vault Implementation**: Rari-Capital/solmate
