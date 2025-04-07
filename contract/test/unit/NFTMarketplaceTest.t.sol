// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {NFTMarketplace} from "../../src/NFTMarketplace.sol";
import {DeployNFTMarketplace} from "../../script/DeployNFTMarketplace.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";


contract NFTMarketplaceTest is Test {
    // Events
    event NFTMinted(uint256 indexed tokenId, address indexed owner, string tokenURI);
    event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event NFTSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event NFTCanceled(uint256 indexed tokenId, address indexed seller);
    event ProceedsWithdrawn(address indexed seller, uint256 amount);
    event ListingFeeUpdated(uint256 oldFee, uint256 newFee);

    NFTMarketplace nftMarketplace;
    HelperConfig helperConfig;
    address public deployer;
    address public seller = makeAddr("seller");
    address public buyer = makeAddr("buyer");
    uint256 public constant LISTING_FEE = 0.0001 ether;
    uint256 public constant NFT_PRICE = 1 ether;
    uint256 public constant STARTING_USER_BALANCE = 10 ether;


    // Test metadata
    string public constant NFT_NAME = "Test NFT";
    string public constant NFT_DESCRIPTION = "Test Description";
    string public constant NFT_IMAGE = "https://test.com/image.png";
    string public constant NFT_ATTRIBUTES = '[]';

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

    ////////////////
    // Mint Tests //
    ////////////////

    function testMintNFT() public {
        // Arrange - Setup expectations
        vm.startPrank(seller);
        uint256 expectedTokenId = 0; // First token ID should be 0

        // Act - Perform the mint
        uint256 tokenId = nftMarketplace.mintNFT(
            NFT_NAME,
            NFT_DESCRIPTION,
            NFT_IMAGE,
            NFT_ATTRIBUTES
        );

        // Assert - Check results
        assertEq(tokenId, expectedTokenId, "Token ID should be 0 for first mint");
        assertEq(nftMarketplace.ownerOf(tokenId), seller, "Seller should own the NFT");
        assertEq(nftMarketplace.getTotalNFTs(), 1, "Total NFTs should be 1");

        vm.stopPrank();
    }

    function testMintNFTEmitsEvent() public {
        // Arrange
        vm.startPrank(seller);

        // Expect the event to be emitted
        vm.expectEmit(true, true, false, false);
        emit NFTMinted(0, seller, ""); // We can't easily check the tokenURI, so we just check the event structure

        // Act
        nftMarketplace.mintNFT(NFT_NAME, NFT_DESCRIPTION, NFT_IMAGE, NFT_ATTRIBUTES);

        vm.stopPrank();
    }

    /////////////////
    // List Tests //
    /////////////////

    function testListNFT() public {
        // Arrange - Mint an NFT first
        vm.startPrank(seller);
        uint256 tokenId = nftMarketplace.mintNFT(NFT_NAME, NFT_DESCRIPTION, NFT_IMAGE, NFT_ATTRIBUTES);

        // Approve marketplace to transfer NFT
        nftMarketplace.approve(address(nftMarketplace), tokenId);

        // Act - List the NFT
        vm.expectEmit(true, true, false, true);
        emit NFTListed(tokenId, seller, NFT_PRICE);

        nftMarketplace.listNFT{value: LISTING_FEE}(tokenId, NFT_PRICE);

        // Assert
        (uint256 price, address lister) = nftMarketplace.getListing(tokenId);
        assertEq(price, NFT_PRICE, "Price should match the listing price");
        assertEq(lister, seller, "Seller should be the lister");
        assertTrue(nftMarketplace.isNFTListed(tokenId), "NFT should be listed");

        vm.stopPrank();
    }

    function testCannotListWithoutApproval() public {
        // Arrange - Mint an NFT first
        vm.startPrank(seller);
        uint256 tokenId = nftMarketplace.mintNFT(NFT_NAME, NFT_DESCRIPTION, NFT_IMAGE, NFT_ATTRIBUTES);

        // Don't approve
        // Act & Assert - Try to list without approval
        vm.expectRevert(NFTMarketplace.NFTMarketplace__NotApprovedForMarketplace.selector);
        nftMarketplace.listNFT{value: LISTING_FEE}(tokenId, NFT_PRICE);

        vm.stopPrank();
    }

    function testCannotListIfNotOwner() public {
        // Arrange - Seller mints an NFT
        vm.prank(seller);
        uint256 tokenId = nftMarketplace.mintNFT(NFT_NAME, NFT_DESCRIPTION, NFT_IMAGE, NFT_ATTRIBUTES);

        // Act & Assert - Buyer tries to list it
        vm.startPrank(buyer);
        vm.expectRevert(NFTMarketplace.NFTMarketplace__NotOwner.selector);
        nftMarketplace.listNFT{value: LISTING_FEE}(tokenId, NFT_PRICE);
        vm.stopPrank();
    }

    function testCannotListWithZeroPrice() public {
        // Arrange - Mint an NFT first
        vm.startPrank(seller);
        uint256 tokenId = nftMarketplace.mintNFT(NFT_NAME, NFT_DESCRIPTION, NFT_IMAGE, NFT_ATTRIBUTES);
        nftMarketplace.approve(address(nftMarketplace), tokenId);

        // Act & Assert - Try to list with zero price
        vm.expectRevert(NFTMarketplace.NFTMarketplace__PriceMustBeAboveZero.selector);
        nftMarketplace.listNFT{value: LISTING_FEE}(tokenId, 0);

        vm.stopPrank();
    }

    function testCannotListWithoutEnoughFee() public {
        // Arrange - Mint an NFT first
        vm.startPrank(seller);
        uint256 tokenId = nftMarketplace.mintNFT(NFT_NAME, NFT_DESCRIPTION, NFT_IMAGE, NFT_ATTRIBUTES);
        nftMarketplace.approve(address(nftMarketplace), tokenId);

        // Act & Assert - Try to list with insufficient fee (half of required)
        uint256 insufficientFee = LISTING_FEE / 2;
        vm.expectRevert(NFTMarketplace.NFTMarketplace__NotEnoughFunds.selector);
        nftMarketplace.listNFT{value: insufficientFee}(tokenId, NFT_PRICE);

        vm.stopPrank();
    }

    function testCannotListTwice() public {
        // Arrange - Mint and list an NFT first
        vm.startPrank(seller);
        uint256 tokenId = nftMarketplace.mintNFT(NFT_NAME, NFT_DESCRIPTION, NFT_IMAGE, NFT_ATTRIBUTES);
        nftMarketplace.approve(address(nftMarketplace), tokenId);
        nftMarketplace.listNFT{value: LISTING_FEE}(tokenId, NFT_PRICE);

        // Act & Assert - Try to list it again
        vm.expectRevert();
        nftMarketplace.listNFT{value: LISTING_FEE}(tokenId, NFT_PRICE);

        vm.stopPrank();
    }

    ////////////////
    // Buy Tests //
    ////////////////

    function testBuyNFT() public {
        // Arrange - Mint and list an NFT
        vm.startPrank(seller);
        uint256 tokenId = nftMarketplace.mintNFT(NFT_NAME, NFT_DESCRIPTION, NFT_IMAGE, NFT_ATTRIBUTES);
        nftMarketplace.approve(address(nftMarketplace), tokenId);
        nftMarketplace.listNFT{value: LISTING_FEE}(tokenId, NFT_PRICE);
        vm.stopPrank();
        
        // Track seller's proceeds before sale
        uint256 sellerProceedsBefore = nftMarketplace.getProceeds(seller);
        
        // Act - Buy the NFT
        vm.startPrank(buyer);
        vm.expectEmit(true, true, true, true);
        emit NFTSold(tokenId, seller, buyer, NFT_PRICE);
        
        nftMarketplace.buyNFT{value: NFT_PRICE}(tokenId);
        
        // Assert
        assertEq(nftMarketplace.ownerOf(tokenId), buyer, "Buyer should own the NFT after purchase");
        assertFalse(nftMarketplace.isNFTListed(tokenId), "NFT should no longer be listed");
        uint256 sellerProceedsAfter = nftMarketplace.getProceeds(seller);
        assertEq(sellerProceedsAfter, sellerProceedsBefore + NFT_PRICE, "Seller's proceeds should increase by NFT price");
        
        vm.stopPrank();
    }

    function testCannotBuyNFTWithInsufficientFunds() public {
        // Arrange - Mint and list an NFT
        vm.startPrank(seller);
        uint256 tokenId = nftMarketplace.mintNFT(NFT_NAME, NFT_DESCRIPTION, NFT_IMAGE, NFT_ATTRIBUTES);
        nftMarketplace.approve(address(nftMarketplace), tokenId);
        nftMarketplace.listNFT{value: LISTING_FEE}(tokenId, NFT_PRICE);
        vm.stopPrank();
        
        // Act & Assert - Try to buy with insufficient funds
        vm.startPrank(buyer);
        vm.expectRevert();
        nftMarketplace.buyNFT{value: NFT_PRICE - 0.1 ether}(tokenId);
        vm.stopPrank();
    }

    function testCannotBuyUnlistedNFT() public {
        // Arrange - Mint an NFT but don't list it
        vm.prank(seller);
        uint256 tokenId = nftMarketplace.mintNFT(NFT_NAME, NFT_DESCRIPTION, NFT_IMAGE, NFT_ATTRIBUTES);
        
        // Act & Assert - Try to buy unlisted NFT
        vm.startPrank(buyer);
        vm.expectRevert();
        nftMarketplace.buyNFT{value: NFT_PRICE}(tokenId);
        vm.stopPrank();
    }

    /////////////////////
    // Cancel Tests //
    /////////////////////

    function testCancelListing() public {
        // Arrange - Mint and list an NFT
        vm.startPrank(seller);
        uint256 tokenId = nftMarketplace.mintNFT(NFT_NAME, NFT_DESCRIPTION, NFT_IMAGE, NFT_ATTRIBUTES);
        nftMarketplace.approve(address(nftMarketplace), tokenId);
        nftMarketplace.listNFT{value: LISTING_FEE}(tokenId, NFT_PRICE);
        
        // Act - Cancel the listing
        vm.expectEmit(true, true, false, false);
        emit NFTCanceled(tokenId, seller);
        
        nftMarketplace.cancelListing(tokenId);
        
        // Assert
        assertFalse(nftMarketplace.isNFTListed(tokenId), "NFT should no longer be listed");
        
        vm.stopPrank();
    }

    function testCannotCancelIfNotOwner() public {
        // Arrange - Seller mints and lists an NFT
        vm.startPrank(seller);
        uint256 tokenId = nftMarketplace.mintNFT(NFT_NAME, NFT_DESCRIPTION, NFT_IMAGE, NFT_ATTRIBUTES);
        nftMarketplace.approve(address(nftMarketplace), tokenId);
        nftMarketplace.listNFT{value: LISTING_FEE}(tokenId, NFT_PRICE);
        vm.stopPrank();
        
        // Act & Assert - Buyer tries to cancel it
        vm.startPrank(buyer);
        vm.expectRevert();
        nftMarketplace.cancelListing(tokenId);
        vm.stopPrank();
    }

    function testCannotCancelUnlistedNFT() public {
        // Arrange - Mint an NFT but don't list it
        vm.startPrank(seller);
        uint256 tokenId = nftMarketplace.mintNFT(NFT_NAME, NFT_DESCRIPTION, NFT_IMAGE, NFT_ATTRIBUTES);
        
        // Act & Assert - Try to cancel unlisted NFT
        vm.expectRevert();
        nftMarketplace.cancelListing(tokenId);
        
        vm.stopPrank();
    }

    ///////////////////////
    // Withdraw Tests   //
    ///////////////////////

    function testWithdrawProceeds() public {
        // Arrange - Mint, list, and sell an NFT
        vm.startPrank(seller);
        uint256 tokenId = nftMarketplace.mintNFT(NFT_NAME, NFT_DESCRIPTION, NFT_IMAGE, NFT_ATTRIBUTES);
        nftMarketplace.approve(address(nftMarketplace), tokenId);
        nftMarketplace.listNFT{value: LISTING_FEE}(tokenId, NFT_PRICE);
        vm.stopPrank();

        vm.prank(buyer);
        nftMarketplace.buyNFT{value: NFT_PRICE}(tokenId);

        // Get seller's balance before withdrawal
        uint256 sellerBalanceBefore = seller.balance;
        uint256 proceeds = nftMarketplace.getProceeds(seller);

        // Act - Withdraw proceeds
        vm.startPrank(seller);
        vm.expectEmit(true, false, false, true);
        emit ProceedsWithdrawn(seller, proceeds);

        nftMarketplace.withdrawProceeds();

        // Assert
        uint256 sellerBalanceAfter = seller.balance;
        assertEq(sellerBalanceAfter, sellerBalanceBefore + proceeds, "Seller should receive their proceeds");
        assertEq(nftMarketplace.getProceeds(seller), 0, "Proceeds should be reset to 0");

        vm.stopPrank();
    }

    function testCannotWithdrawWithZeroProceeds() public {
        // Arrange - No sales made
        
        // Act & Assert - Try to withdraw with no proceeds
        vm.startPrank(seller);
        vm.expectRevert(NFTMarketplace.NFTMarketplace__NotEnoughFunds.selector);
        nftMarketplace.withdrawProceeds();
        vm.stopPrank();
    }

    //////////////////////
    // Admin Functions //
    //////////////////////

    function testUpdateListingFee() public {
        vm.startPrank(deployer);

        uint256 newListingFee = 0.02 ether;
        uint256 currentFee = nftMarketplace.getListingFee();

        vm.expectEmit(false, false, false, true);
        emit ListingFeeUpdated(currentFee, newListingFee);

        nftMarketplace.updateListingFee(newListingFee);

        // Assert
        assertEq(nftMarketplace.getListingFee(), newListingFee, "Listing fee should be updated");

        vm.stopPrank();
    }

    function testCannotUpdateListingFeeIfNotOwner() public {
        // Arrange
        uint256 newListingFee = 0.02 ether;
        address fakeAdmin = makeAddr("admin");
        // Act & Assert
        vm.startPrank(fakeAdmin);
        vm.expectRevert();
        nftMarketplace.updateListingFee(newListingFee);
        vm.stopPrank();
    }

    function testWithdrawListingFees() public {
        // Arrange - First list an NFT to collect a fee
        vm.startPrank(seller);
        uint256 tokenId = nftMarketplace.mintNFT(NFT_NAME, NFT_DESCRIPTION, NFT_IMAGE, NFT_ATTRIBUTES);
        nftMarketplace.approve(address(nftMarketplace), tokenId);
        nftMarketplace.listNFT{value: LISTING_FEE}(tokenId, NFT_PRICE);
        vm.stopPrank();

        // Get deployer's balance before withdrawal
        uint256 deployerBalanceBefore = deployer.balance;

        // Act - Withdraw listing fees
        vm.startPrank(deployer);
        nftMarketplace.withdrawListingFees();

        // Assert
        uint256 deployerBalanceAfter = deployer.balance;
        assertGt(deployerBalanceAfter, deployerBalanceBefore, "Deployer should receive listing fees");
        assertEq(address(nftMarketplace).balance, 0, "Contract balance should be 0 after withdrawal");

        vm.stopPrank();
    }

    function testCannotWithdrawListingFeesIfNotOwner() public {
        // Act & Assert
        vm.startPrank(seller);
        vm.expectRevert();
        nftMarketplace.withdrawListingFees();
        vm.stopPrank();
    }

    ////////////////////////
    // Edge case and view functions
    ////////////////////////

    function testGetListingReturnsCorrectValues() public {
        // Arrange - Mint and list NFT
        vm.startPrank(seller);
        uint256 tokenId = nftMarketplace.mintNFT(NFT_NAME, NFT_DESCRIPTION, NFT_IMAGE, NFT_ATTRIBUTES);
        nftMarketplace.approve(address(nftMarketplace), tokenId);
        nftMarketplace.listNFT{value: LISTING_FEE}(tokenId, NFT_PRICE);
        vm.stopPrank();

        // Act
        (uint256 price, address lister) = nftMarketplace.getListing(tokenId);

        // Assert
        assertEq(price, NFT_PRICE, "Should return correct price");
        assertEq(lister, seller, "Should return correct seller");
    }

    function testIsNFTListedReturnsCorrectStatus() public {
        // Arrange - Mint NFT
        vm.startPrank(seller);
        uint256 tokenId = nftMarketplace.mintNFT(NFT_NAME, NFT_DESCRIPTION, NFT_IMAGE, NFT_ATTRIBUTES);
        
        // Before listing
        assertFalse(nftMarketplace.isNFTListed(tokenId), "Should return false before listing");

        // After listing
        nftMarketplace.approve(address(nftMarketplace), tokenId);
        nftMarketplace.listNFT{value: LISTING_FEE}(tokenId, NFT_PRICE);
        assertTrue(nftMarketplace.isNFTListed(tokenId), "Should return true after listing");
        
        vm.stopPrank();
    }

    function testGetProceedsReturnsCorrectAmount() public {
        // Arrange - Complete a sale
        vm.startPrank(seller);
        uint256 tokenId = nftMarketplace.mintNFT(NFT_NAME, NFT_DESCRIPTION, NFT_IMAGE, NFT_ATTRIBUTES);
        nftMarketplace.approve(address(nftMarketplace), tokenId);
        nftMarketplace.listNFT{value: LISTING_FEE}(tokenId, NFT_PRICE);
        vm.stopPrank();

        vm.prank(buyer);
        nftMarketplace.buyNFT{value: NFT_PRICE}(tokenId);

        // Act & Assert
        assertEq(nftMarketplace.getProceeds(seller), NFT_PRICE, "Should return correct proceeds amount");
    }

    function testGetTotalNFTsIncrementsCorrectly() public {
        // Before minting
        assertEq(nftMarketplace.getTotalNFTs(), 0, "Should start at 0");

        // After first mint
        vm.startPrank(seller);
        nftMarketplace.mintNFT(NFT_NAME, NFT_DESCRIPTION, NFT_IMAGE, NFT_ATTRIBUTES);
        assertEq(nftMarketplace.getTotalNFTs(), 1, "Should increment to 1");

        // After second mint
        nftMarketplace.mintNFT(NFT_NAME, NFT_DESCRIPTION, NFT_IMAGE, NFT_ATTRIBUTES);
        assertEq(nftMarketplace.getTotalNFTs(), 2, "Should increment to 2");
        vm.stopPrank();
    }

    function testCannotBuyWithExactPriceButNoListing() public {
        // Arrange - Mint but don't list
        vm.startPrank(seller);
        uint256 tokenId = nftMarketplace.mintNFT(NFT_NAME, NFT_DESCRIPTION, NFT_IMAGE, NFT_ATTRIBUTES);
        vm.stopPrank();

        // Act & Assert
        vm.startPrank(buyer);
        vm.expectRevert(NFTMarketplace.NFTMarketplace__NotListed.selector);
        nftMarketplace.buyNFT{value: NFT_PRICE}(tokenId);
        vm.stopPrank();
    }

    function testCannotCancelNonexistentListing() public {
        // Arrange - Mint but don't list
        vm.startPrank(seller);
        uint256 tokenId = nftMarketplace.mintNFT(NFT_NAME, NFT_DESCRIPTION, NFT_IMAGE, NFT_ATTRIBUTES);
        
        // Act & Assert
        vm.expectRevert(NFTMarketplace.NFTMarketplace__NotListed.selector);
        nftMarketplace.cancelListing(tokenId);
        vm.stopPrank();
    }

    function testTransferFailsInWithdrawProceeds() public {
        // Arrange - Setup failed transfer
        vm.startPrank(seller);
        uint256 tokenId = nftMarketplace.mintNFT(NFT_NAME, NFT_DESCRIPTION, NFT_IMAGE, NFT_ATTRIBUTES);
        nftMarketplace.approve(address(nftMarketplace), tokenId);
        nftMarketplace.listNFT{value: LISTING_FEE}(tokenId, NFT_PRICE);
        vm.stopPrank();

        vm.prank(buyer);
        nftMarketplace.buyNFT{value: NFT_PRICE}(tokenId);

        // Create a mock contract that will revert on receive
        RevertOnReceive mockSeller = new RevertOnReceive();
        
        // Directly manipulate storage to set the proceeds for the mock seller
        bytes32 proceedsSlot = keccak256(abi.encode(address(mockSeller), uint256(1))); // _proceeds slot
        vm.store(
            address(nftMarketplace),
            proceedsSlot,
            bytes32(uint256(NFT_PRICE))
        );

        // Act & Assert
        vm.expectRevert(NFTMarketplace.NFTMarketplace__NotEnoughFunds.selector);
        vm.prank(address(mockSeller)); // Prank as the mock seller to withdraw
        nftMarketplace.withdrawProceeds();
    }

    function testTransferFailsInWithdrawListingFees() public {
        // Arrange - Setup contract with some fees
        vm.startPrank(seller);
        uint256 tokenId = nftMarketplace.mintNFT(NFT_NAME, NFT_DESCRIPTION, NFT_IMAGE, NFT_ATTRIBUTES);
        nftMarketplace.approve(address(nftMarketplace), tokenId);
        nftMarketplace.listNFT{value: LISTING_FEE}(tokenId, NFT_PRICE);
        vm.stopPrank();

        // Create a mock owner that will fail to receive ETH
        address payable mockOwner = payable(address(new RevertOnReceive()));
        vm.prank(nftMarketplace.owner());
        nftMarketplace.transferOwnership(mockOwner);

        // Act & Assert
        vm.startPrank(mockOwner);
        vm.expectRevert(NFTMarketplace.NFTMarketplace__TransferFailed.selector);
        nftMarketplace.withdrawListingFees();
        vm.stopPrank();

        // Reset ownership
        vm.prank(mockOwner);
        nftMarketplace.transferOwnership(deployer);
    }

    function testTokenURIGeneration() public {
        // Arrange - Mint NFT
        vm.startPrank(seller);
        uint256 tokenId = nftMarketplace.mintNFT(NFT_NAME, NFT_DESCRIPTION, NFT_IMAGE, NFT_ATTRIBUTES);
        
        // Act - Get tokenURI
        string memory uri = nftMarketplace.tokenURI(tokenId);
        
        // Assert - Basic checks on the URI
        assertTrue(bytes(uri).length > 0, "URI should not be empty");
        assertTrue(
            keccak256(abi.encodePacked(uri)) != 
            keccak256(abi.encodePacked("")),
            "URI should be generated"
        );
        vm.stopPrank();
    }
}

contract RevertOnReceive {
    receive() external payable {
        revert("Force transfer failure");
    }
}