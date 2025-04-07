// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {NFTMarketplace} from "../../src/NFTMarketplace.sol";
import {DeployNFTMarketplace} from "../../script/DeployNFTMarketplace.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";


contract NFTMarketplaceIntegration is Test {

    NFTMarketplace nftMarketplace;
    HelperConfig helperConfig;
    address public deployer;
    address public seller = makeAddr("seller");
    address public buyer = makeAddr("buyer");
    uint256 public constant LISTING_FEE = 0.0001 ether;
    uint256 public constant NFT_PRICE = 1 ether;
    uint256 public constant STARTING_USER_BALANCE = 10 ether;
    uint256 private nftPrice = 1 ether;


    function setUp() public {
        DeployNFTMarketplace marketplaceDeployer = new DeployNFTMarketplace();
        (nftMarketplace, helperConfig) = marketplaceDeployer.run();

        deployer = nftMarketplace.owner();

        vm.startPrank(deployer);
        // Fund accounts
        vm.deal(seller, STARTING_USER_BALANCE);
        vm.deal(buyer, STARTING_USER_BALANCE);
        vm.stopPrank();
    }

    function test_FullLifecycle() public {
        // 1. Seller mints NFT
        vm.startPrank(seller);
        uint256 newNftId = nftMarketplace.mintNFT(
            "Mash Mushroom",
            "This is a Mash Mushroom",
            "ipfs://test.com/image.png",
            '["trait_type":"Savannah","value":"rare"]'
        );

        // 2. Seller approves and lists NFT
        nftMarketplace.approve(address(nftMarketplace), newNftId);
        nftMarketplace.listNFT{value: LISTING_FEE}(newNftId, nftPrice);
        vm.stopPrank();

        // 3. Buyer purchases NFT
        vm.prank(buyer);
        nftMarketplace.buyNFT{value: nftPrice}(newNftId);

        // 4. Seller withdraws proceeds
        uint256 initialBalance = seller.balance;
        vm.prank(seller);
        nftMarketplace.withdrawProceeds();
        assertEq(seller.balance, initialBalance + nftPrice);

        // 5. Owner withdraws listing fees
        uint256 ownerInitialBalance = deployer.balance;
        vm.prank(deployer);
        nftMarketplace.withdrawListingFees();
        assertEq(deployer.balance, ownerInitialBalance + LISTING_FEE);

        // 6. Final checks
        assertEq(nftMarketplace.ownerOf(newNftId), buyer);
        assertFalse(nftMarketplace.isNFTListed(newNftId));
        assertEq(nftMarketplace.getProceeds(seller), 0);
    }
}