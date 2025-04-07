# Celusion Web3 Developer Test Task

**Candidate:** Jude Miracle
**Test Network:** Sepolia (Contract Address: [](`https://sepolia.etherscan.io/search?q=0xeAA57c46cE1D692De22d122b4f94c9676A3a7Ac8`))

## Folder structure
```
celusion-web3-dev-test1/
├── client/        # React (Next.js) frontend
├── contract/      # Solidity smart contract using Foundry
├── celusion/      # Subgraph for The Graph
└── README.md
```

## Clone repository
```
git clone git@github.com:am-miracle/celusion-web3-dev-test1.git
cd celusion-web3-dev-test1
```

## Environment variables

smart contract:
```
ANVIL_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
PRIVATE_KEY=
SEPOLIA_RPC_URL=""
ANVIL_RPC_URL=http://localhost:8545

```

frontend:
```
NEXT_PUBLIC_SUBGRAPH_URL=""
NEXT_PUBLIC_RPC_URL=""

NEXT_PUBLIC_PINATA_API_KEY=""
NEXT_PUBLIC_PINATA_SECRET_KEY=""
NEXT_PUBLIC_PINATA_JWT=""
```

## Set up

Subgraph:
```
cd celusion
graph codegen
graph build
graph deploy celusion
```

Frontend:
```
cd client
npm install
npm run dev
```

Smart contract:
```
cd contract
forge build
forge test
forge coverage
forge script script/DeployNFTMarketplace.s.sol --rpc-url <YOUR_RPC_URL> --private-key <YOUR_PRIVATE_KEY> --broadcast
```
Note: Uncomment the `fuzz/Handler.t.sol` and `fuzz/Invariants.t.sol` functions and run `forge test` command

## Features Overview
#### Smart Contract (contract/)
Mint, list, buy NFTs

Cancel listing

Withdraw proceeds

Reentrancy protection

### Frontend (client/)
Connect wallet with MetaMask

Mint NFT form with image + name + description

Marketplace view (buy/list NFTs)

Withdraw button

Real-time updates via Graph


## Video
---
/client/video.gif
---