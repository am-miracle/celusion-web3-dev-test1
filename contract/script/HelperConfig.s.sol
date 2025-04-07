// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";

// error
error HelperConfig__PrivateKeyNotSet();

contract HelperConfig is Script {
    struct NetworkConfig {
        string marketplaceName;
        string marketplaceSymbol;
        uint256 listingFee;
        uint256 deployerKey;
    }

    uint256 public immutable DEFAULT_ANVIL_DEPLOYER_KEY =
        0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;

    NetworkConfig public activeNetworkConfig;

    constructor() {
        if (block.chainid == 11155111) { // Sepolia
            activeNetworkConfig = getSepoliaConfig();
        } else if (block.chainid == 1) { // Mainnet
            activeNetworkConfig = getMainnetConfig();
        } else {
            activeNetworkConfig = getOrCreateAnvilEthConfig();
        }
    }

    function getSepoliaConfig() public view returns (NetworkConfig memory) {
         uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        if (deployerKey == 0) {
            revert HelperConfig__PrivateKeyNotSet();
        }

        return NetworkConfig({
            marketplaceName: "CelusionNFTMarket",
            marketplaceSymbol: "CNFTM",
            listingFee: 0.0001 ether,
            deployerKey: deployerKey
        });
    }

    function getMainnetConfig() public view returns (NetworkConfig memory) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        if(deployerKey == 0) {
            revert HelperConfig__PrivateKeyNotSet();
        }

        return NetworkConfig({
            marketplaceName: "CelusionNFTMarket",
            marketplaceSymbol: "CNFTM",
            listingFee: 0.005 ether,
            deployerKey: deployerKey
        });
    }

    /**
     * @notice Returns the configuration for the Anvil network or creates one if it doesn't exist.
     */
    function getOrCreateAnvilEthConfig() public view returns (NetworkConfig memory) {
        if (activeNetworkConfig.deployerKey != 0) {
            return activeNetworkConfig;
        }

        return NetworkConfig({
            marketplaceName: "CelusionNFTMarket",
            marketplaceSymbol: "CNFTM",
            listingFee: 0.0001 ether,
            deployerKey: DEFAULT_ANVIL_DEPLOYER_KEY
        });
    }
}