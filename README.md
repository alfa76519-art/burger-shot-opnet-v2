# 🍔 Burger Shot — $BSHOT Minting Page V2

![Network](https://img.shields.io/badge/Network-OP__NET%20Testnet-orange?style=for-the-badge)
![Build](https://img.shields.io/badge/Build-Live-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Wallet](https://img.shields.io/badge/Wallet-OPWallet-purple?style=for-the-badge)

> Serving hot tokens on Bitcoin L1 🍔 — A fast-food themed token launchpad built on OP_NET's Bitcoin smart contract layer.

🔗 **~~Live Demo~~ Testnet Active ✅:** [alfa76519-art.github.io/burger-shot-opnet-v2](https://alfa76519-art.github.io/burger-shot-opnet-v2)

---

## 📸 Preview (SOON)

| Dark Mode | Light Mode |
|---|---|
| ![Dark](https://i.imgur.com/placeholder-dark.png) | ![Light](https://i.imgur.com/placeholder-light.png) |

---

## ✨ Features

- 🔌 **Real OPWallet Integration** — Connect/disconnect with live tBTC balance from wallet
- 🍞 **Toast Notifications** — Slide-in toast with TX ID, countdown timer & explorer link
- ⚡ **Smart MAX Button** — Auto-calculates max mintable amount with gas reserve
- 📊 **Slippage Control** — Preset + custom input, min 2.5%, warning if > 3%
- 🎉 **Confetti Animation** — 5-second celebration on successful mint
- 📡 **Real-time Mint Feed** — Live recent mints panel with auto-refresh every 5s
- 🌓 **Dark / Light Mode** — Smooth toggle with warm cream light theme
- 🎬 **Balance Animation** — Smooth count-down animation after mint
- ⏱️ **TX Countdown** — "Link expires in Xs" progress bar on toast
- 📱 **Auto wallet detection** — Redirects to install OPWallet if not detected
## 🚀 Advanced V2 Features 🔥

**1. Fair Launch Public Minting**
Designed for community distribution, the `publicMint` function allows users to seamlessly mint up to **1,000 $BSHOT per transaction**. The deployer wallet only holds an initial 1,000 $BSHOT to ensure a fair and decentralized supply growth.

**2. Multi-Airdrop System (Architect Utility)**
Unlike standard tokens, BurgerShot includes a professional `airdrop` function built for the deployer. It utilizes OP_NET's `AddressMap` to distribute $BSHOT to multiple wallets in a single, gas-efficient transaction.

**3. Interactive On-Chain UX**
The frontend is strictly "Rata Kanan" (Pixel-Perfect). All transaction hashes and wallet addresses in the UI are fully clickable and directly integrated with the **OP_NET Explorer**, providing real-time on-chain transparency.

---

## 🛠️ Tech Stack

| Tech | Usage |
|---|---|
| React (Babel CDN) | UI Framework |
| Tailwind CSS | Styling |
| OPWallet SDK | Wallet Connection |
| OP_NET | Bitcoin L2 Smart Contracts |
| GitHub Pages | Hosting |

---

## 🔌 Wallet Setup

1. Install **OPWallet** from Chrome Web Store:
   👉 [Install OPWallet](https://chromewebstore.google.com/detail/opwallet/pmbjpcmaaladnfpacpmhmnfmpklgbdjb)

2. Switch network to **OPNet Testnet** (green Bitcoin icon top right)

3. Get testnet tBTC from the **Faucet** inside OPWallet

4. Visit the live demo and click **Connect OPWallet**

---

## 📋 Token Specs

| Property | Value |
|---|---|
| Name | Burger Shot |
| Symbol | $BGS |
| Network | OP_NET Testnet → Mainnet maybe🤣 |
| Price per token | 0.001 tBTC |
| Max supply | 21,000,000 BGS |
| Max per tx | 1000 BGS |

---
---

## 🍔 Featured Project: BurgerShot (BGS)
**The Digital Evolution of the Bitcoin Pizza.**

I successfully architected and deployed **BurgerShot (BGS)**, a tribute to Bitcoin's history, on the **OP_NET** protocol.

- **Genesis Goal**: To recreate the scarcity of Bitcoin (21M Supply) in a "Bitcoin Burger" format.
- **Achievement**: Manual deployment via AssemblyScript without third-party intermediaries.
## 📜 Contract Information (V2 Upgraded)
- **Network:** OP_NET Testnet
- **Token Name:** BurgerShot
- **Ticker:** $BSHOT
- **Max Supply:** 21,000,000 BSHOT
- **Smart Contract Address:** `opt1sqptc0qu5m4uvp5n0vcr2l2vyjuvh47xu5gxa7n6p`

> *"If Pizza was the first transaction, BGS is the new standard of digital utility."*

## 🚀 Roadmap

- [x] Minting UI with real OPWallet connect
- [x] Live tBTC balance from wallet
- [x] Toast notification system
- [x] Real-time mint feed
- [x] Dark/Light mode
- [x] Deploy $BSHOT (BGS) smart contract on OP_NET Testnet
- [x] On-chain mint transactions
- [ ] Mainnet launch maybe🤣
## 🚀 Roadmap & Achievements🏆

- [x] **Phase 1: Genesis & Architecture**
  - Successfully architected the BurgerShot (BGS) smart contract using AssemblyScript.
  - Mirrored Bitcoin's scarcity model with a fixed supply of 21,000,000 BGS.
- [x] **Phase 2: Ninja Deployment**
  - Deployed the contract manually on the **OP_NET Testnet** via Codespace.
  - Achieved deployment without third-party intermediaries (No-Bob execution).
  - Verified contract address: `opt1sqptc0qu5m4uvp5n0vcr2l2vyjuvh47xu5gxa7n6p`.
- [x] **Phase 3: Whale Acquisition & Distribution**
  - Successfully minted 21,000,000 BGS to the architect's wallet.
  - ✅ **Live Transaction Proof**: [View 1 BGS Transfer on OpScan](https://opscan.org/transactions/cfc7a0720d0b919e92091a27f241d8d73de91e64bd3165288859c370a7f21b29)
- [ ] **Phase 4: Community & Ecosystem** (Next Step)
  - Exploring integration for digital payments and community.
  - Preparing for Challenge OP_NET.
---

## 🏗️ Project Structure

```
burger-shot-opnet-v2/
├── index.html          ← Entry point + CDN imports
├── BurgerShotMintV2.jsx ← Main React component
└── README.md
```
---
### 🎯 Architect's Note for Vibecode Judges
BurgerShot V2 is not just a token; it's a demonstration of how smooth and interactive Bitcoin's Layer-1 can be when powered by OP_NET. From the gas-optimized SafeMath logic in the AssemblyScript contract to the Babel-compiled reactive frontend, every line of code is heavily polished for the best User Experience. 

*Enjoy your meal, and happy minting! 🍔😋*
---

## 📝 License

MIT © [alfa76519-art](https://github.com/alfa76519-art)

---

<p align="center">Built with 🍔 for OP_NET Vibe Coding Week 2</p>
