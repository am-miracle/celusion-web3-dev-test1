// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {NFTMarketplace} from "../src/NFTMarketplace.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract DeployNFTMarketplace is Script {
    function run() external returns (NFTMarketplace, HelperConfig) {
        HelperConfig helperConfig = new HelperConfig();
        (
            string memory marketplaceName,
            string memory marketplaceSymbol,
            uint256 listingFee,
            uint256 deployerKey
        ) = helperConfig.activeNetworkConfig();

        vm.startBroadcast(deployerKey);
        NFTMarketplace marketplace = new NFTMarketplace(
            marketplaceName,
            marketplaceSymbol,
            listingFee
        );
        vm.stopBroadcast();

        return (marketplace, helperConfig);
    }
}