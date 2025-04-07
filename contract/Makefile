-include .env

.PHONY: all test clean deploy help install snapshot format anvil

help:
	@echo "Usage:"
	@echo " make deploy [ARGS=...]\n	example: make deploy ARGS=\"--network sepolia\""

all: clean remove install update build

clean:; forge clean

remove:; rm -rf .gitmodules && rm -rf .git/modules/* && rm -rf lib && touch .gitmodules && git add . && git commit -m "modules"

install:; forge install https://github.com/OpenZeppelin/openzeppelin-contracts.git --no-commit && forge install https://github.com/smartcontractkit/chainlink.git --no-commit && forge install https://github.com/Cyfrin/foundry-devops.git --no-commit && forge install https://github.com/transmissions11/solmate.git --no-commit && forge install https://github.com/foundry-rs/forge-std.git --no-commit

update:; forge update

build:; forge build

test:; forge test

snapshot:; forge snapshot

format:; forge fmt

anvil:; anvil --block-time 1

NETWORK_ARGS := --rpc-url $(ANVIL_RPC_URL) --private-key $(ANVIL_DEFAULT_KEY) --broadcast -vvvv

ifeq ($(findstring --network sepolia,$(ARGS)),--network sepolia)
	NETWORK_ARGS := --rpc-url $(SEPOLIA_RPC_URL) --private-key $(PRIVATE_KEY) --broadcast --verify --etherscan-api-key $(ETHERSCAN_API_KEY) -vvvv
endif


deployNftMarketplace:
	@forge script script/DeployNFTMarketplace.s.sol:DeployNFTMarketplace $(NETWORK_ARGS)

# 0xeAA57c46cE1D692De22d122b4f94c9676A3a7Ac8
# contract/out/NFTMarketplace.sol/NFTMarketplace.json
# NFTMarketplace