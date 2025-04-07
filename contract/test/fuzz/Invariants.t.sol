// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.20;

// import {Test, console} from "forge-std/Test.sol";
// import {StdInvariant} from "forge-std/StdInvariant.sol";
// import {NFTMarketplace} from "../../src/NFTMarketplace.sol";
// import {Handler} from "./Handler.t.sol";

// contract NFTMarketplaceFuzzTest is StdInvariant, Test {
//     NFTMarketplace public marketplace;
//     Handler public handler;

//     address public owner = address(1);

//     uint256 private constant LISTING_FEE = 0.01 ether;
//     string private constant NAME = "Fuzz Marketplace";
//     string private constant SYMBOL = "FUZZ";

//     function setUp() public {
//         // Deploy the marketplace
//         vm.startPrank(owner);
//         vm.deal(owner, 100 ether);
//         marketplace = new NFTMarketplace(NAME, SYMBOL, LISTING_FEE);
//         vm.stopPrank();

//         // Create the handler
//         handler = new Handler(marketplace, owner);

//         // Target the handler for invariant testing
//         targetContract(address(handler));
//     }

//     function invariant_OwnershipIsConsistent() public {
//         // For each minted NFT, the owner in our handler should match the owner in the contract
//         handler.forEachMintedNFT(this.checkOwnership);
//     }

//     function checkOwnership(uint256 tokenId) external view {
//         address expectedOwner = handler.getNFTOwner(tokenId);
//         try marketplace.ownerOf(tokenId) returns (address actualOwner) {
//             assertEq(actualOwner, expectedOwner, "Ownership mismatch for token");
//         } catch {
//             // If this fails, the NFT should not have an owner in our handler
//             assertEq(address(0), expectedOwner, "Token does not exist but has an owner in handler");
//         }
//     }

//     function invariant_ListingsAreConsistent() public {
//         // For each listing, check if the contract's listing matches our tracking
//         handler.forEachListedNFT(this.checkListing);
//     }

//     function checkListing(uint256 tokenId) external view {
//         bool isListed = handler.getIsListed(tokenId);
//         uint256 expectedPrice = handler.getNFTPrice(tokenId);

//         try marketplace.getListing(tokenId) returns (uint256 price, address seller) {
//             assertTrue(isListed, "NFT is listed in contract but not in handler");
//             assertEq(price, expectedPrice, "Price mismatch for listed NFT");
//             assertEq(seller, handler.getNFTOwner(tokenId), "Seller mismatch for listed NFT");
//         } catch {
//             assertFalse(isListed, "NFT is not listed in contract but listed in handler");
//         }
//     }

//     function invariant_ProceedsAreConsistent() public view {
//         // Check a few sample addresses
//         for (uint256 i = 1; i <= 10; i++) {
//             address user = address(uint160(i));
//             uint256 expectedProceeds = handler.getProceeds(user);
//             uint256 actualProceeds = marketplace.getProceeds(user);
//             assertEq(actualProceeds, expectedProceeds, "Proceeds mismatch");
//         }
//     }

//     function invariant_TotalNFTCount() public view {
//         // The total NFT count should match our tracked minted count
//         assertEq(marketplace.getTotalNFTs(), handler.ghost_mintedCount(), "Total NFT count mismatch");
//     }

//     function invariant_NFTsCannotBeListedMultipleTimes() public view {
//         // Check that the number of currently listed NFTs matches our tracking
//         uint256 listedCount = 0;
//         for (uint256 i = 0; i < handler.ghost_mintedCount(); i++) {
//             try marketplace.isNFTListed(i) returns (bool isListed) {
//                 if (isListed) listedCount++;
//             } catch {
//                 // Ignore non-existent tokens
//             }
//         }

//         // Listed count should be equal to ghost_listedCount - ghost_soldCount - ghost_canceledCount
//         uint256 expectedActiveListings = handler.ghost_listedCount() - handler.ghost_soldCount() - handler.ghost_canceledCount();
//         assertEq(listedCount, expectedActiveListings, "Listed NFT count mismatch");
//     }

//     function testFuzz_MintNFT(
//         string calldata name,
//         string calldata description,
//         string calldata image,
//         string calldata attributes,
//         uint256 actorSeed
//     ) public {
//         handler.mintNFT(name, description, image, attributes, actorSeed);
//     }

//     function testFuzz_ListNFT(
//         uint256 tokenIdSeed,
//         uint256 price,
//         uint256 actorSeed
//     ) public {
//         handler.listNFT(tokenIdSeed, price, actorSeed);
//     }

//     function testFuzz_BuyNFT(
//         uint256 tokenIdSeed,
//         uint256 actorSeed
//     ) public {
//         handler.buyNFT(tokenIdSeed, actorSeed);
//     }

//     function testFuzz_CancelListing(
//         uint256 tokenIdSeed,
//         uint256 actorSeed
//     ) public {
//         handler.cancelListing(tokenIdSeed, actorSeed);
//     }

//     function testFuzz_WithdrawProceeds(uint256 actorSeed) public {
//         handler.withdrawProceeds(actorSeed);
//     }

//     function testFuzz_UpdateListingFee(uint256 newFee) public {
//         handler.updateListingFee(newFee);
//     }
    
//     function testFuzz_WithdrawListingFees() public {
//         handler.withdrawListingFees();
//     }
    
//     function testFuzz_FullCycle(
//         string calldata name,
//         string calldata description,
//         string calldata image,
//         string calldata attributes,
//         uint256 price,
//         uint256 seller,
//         uint256 buyer
//     ) public {
//         // Ensure seller and buyer are different
//         vm.assume(seller % 10 != buyer % 10 && seller % 10 > 0 && buyer % 10 > 0);
        
//         // 1. Mint NFT
//         handler.mintNFT(name, description, image, attributes, seller);
        
//         // 2. List NFT
//         uint256 tokenId = 0; // First token
//         handler.listNFT(tokenId, price, seller);
        
//         // 3. Buy NFT
//         handler.buyNFT(tokenId, buyer);
        
//         // 4. Withdraw proceeds
//         handler.withdrawProceeds(seller);
        
//         // 5. Check invariants
//         invariant_OwnershipIsConsistent();
//         invariant_ListingsAreConsistent();
//         invariant_ProceedsAreConsistent();
//     }
// }