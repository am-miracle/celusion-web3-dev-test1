// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.20;

// import {Test, console} from "forge-std/Test.sol";
// import {NFTMarketplace} from "../../src/NFTMarketplace.sol";

// contract Handler is Test {
//     NFTMarketplace public marketplace;

//     // User addresses
//     address public owner;
//     address public currentActor;

//     // Tracking variables
//     uint256[] public mintedIds;
//     uint256[] public listedIds;
//     mapping(uint256 => bool) public isListed;
//     mapping(address => uint256) public proceeds;
//     mapping(uint256 => uint256) public nftPrices;
//     mapping(uint256 => address) public nftOwners;

//     // Constants
//     uint256 private constant LISTING_FEE = 0.01 ether;
//     uint256 private constant MAX_MINT_PER_ADDRESS = 10;
//     uint256 private constant MAX_ACTORS = 10;
//     uint256 private constant MIN_PRICE = 0.01 ether;
//     uint256 private constant MAX_PRICE = 5 ether;

//     // Ghost variables for invariant testing
//     uint256 public ghost_mintedCount;
//     uint256 public ghost_listedCount;
//     uint256 public ghost_soldCount;
//     uint256 public ghost_canceledCount;

//     constructor(NFTMarketplace _marketplace, address _owner) {
//         marketplace = _marketplace;
//         owner = _owner;
//     }

//     // Helper function to get a bound address
//     function getActor(uint256 actorSeed) public pure returns (address) {
//         return address(uint160(bound(actorSeed, 1, MAX_ACTORS)));
//     }

//     // Set the current actor for the next call
//     function setActor(uint256 actorSeed) public {
//         currentActor = getActor(actorSeed);
//         // Ensure actor has ETH to perform operations
//         vm.deal(currentActor, 10 ether);
//         vm.startPrank(currentActor);
//     }

//     function mintNFT(
//         string calldata name,
//         string calldata description,
//         string calldata image,
//         string calldata attributes,
//         uint256 actorSeed
//     ) public {
//         // Set up the actor
//         setActor(actorSeed);

//         // Check if actor can mint more NFTs
//         uint256 actorMintCount = 0;
//         for (uint256 i = 0; i < mintedIds.length; i++) {
//             if (nftOwners[mintedIds[i]] == currentActor) {
//                 actorMintCount++;
//             }
//         }

//         // Only allow minting if under the limit
//         if (actorMintCount < MAX_MINT_PER_ADDRESS) {
//             try marketplace.mintNFT(name, description, image, attributes) returns (uint256 tokenId) {
//                 mintedIds.push(tokenId);
//                 nftOwners[tokenId] = currentActor;
//                 ghost_mintedCount++;
//             } catch {
//                 // Ignore failures
//             }
//         }

//         vm.stopPrank();
//     }

//     function listNFT(uint256 tokenIdSeed, uint256 price, uint256 actorSeed) public {
//         // Ensure we have NFTs to work with
//         if (mintedIds.length == 0) return;

//         // Get a valid token ID from the minted tokens
//         uint256 tokenIdIndex = bound(tokenIdSeed, 0, mintedIds.length - 1);
//         uint256 tokenId = mintedIds[tokenIdIndex];

//         // Set up the actor
//         setActor(actorSeed);

//         // Ensure the price is reasonable
//         uint256 boundedPrice = bound(price, MIN_PRICE, MAX_PRICE);

//         // Only proceed if actor owns this NFT and it's not already listed
//         if (nftOwners[tokenId] == currentActor && !isListed[tokenId]) {
//             try marketplace.approve(address(marketplace), tokenId) {
//                 try marketplace.listNFT{value: LISTING_FEE}(tokenId, boundedPrice) {
//                     listedIds.push(tokenId);
//                     isListed[tokenId] = true;
//                     nftPrices[tokenId] = boundedPrice;
//                     ghost_listedCount++;
//                 } catch {
//                     // Ignore failures
//                 }
//             } catch {
//                 // Ignore failures
//             }
//         }

//         vm.stopPrank();
//     }

//     function buyNFT(uint256 tokenIdSeed, uint256 actorSeed) public {
//         // Ensure we have listed NFTs to work with
//         if (listedIds.length == 0) return;

//         // Get a valid token ID from the listed tokens
//         uint256 tokenIdIndex = bound(tokenIdSeed, 0, listedIds.length - 1);
//         uint256 tokenId = listedIds[tokenIdIndex];

//         // Set up the actor (different from the owner)
//         setActor(actorSeed);

//         // Only proceed if the NFT is actually listed and actor is not the owner
//         if (isListed[tokenId] && nftOwners[tokenId] != currentActor) {
//             uint256 price = nftPrices[tokenId];
//             address seller = nftOwners[tokenId];

//             try marketplace.buyNFT{value: price}(tokenId) {
//                 // Update our tracking state
//                 proceeds[seller] += price;
//                 nftOwners[tokenId] = currentActor;
//                 isListed[tokenId] = false;

//                 // Remove from listed IDs
//                 for (uint256 i = 0; i < listedIds.length; i++) {
//                     if (listedIds[i] == tokenId) {
//                         listedIds[i] = listedIds[listedIds.length - 1];
//                         listedIds.pop();
//                         break;
//                     }
//                 }

//                 ghost_soldCount++;
//             } catch {
//                 // Ignore failures
//             }
//         }

//         vm.stopPrank();
//     }

//     function cancelListing(uint256 tokenIdSeed, uint256 actorSeed) public {
//         // Ensure we have listed NFTs to work with
//         if (listedIds.length == 0) return;

//         // Get a valid token ID from the listed tokens
//         uint256 tokenIdIndex = bound(tokenIdSeed, 0, listedIds.length - 1);
//         uint256 tokenId = listedIds[tokenIdIndex];

//         // Set up the actor
//         setActor(actorSeed);

//         // Only proceed if actor owns this NFT and it's listed
//         if (nftOwners[tokenId] == currentActor && isListed[tokenId]) {
//             try marketplace.cancelListing(tokenId) {
//                 isListed[tokenId] = false;

//                 // Remove from listed IDs
//                 for (uint256 i = 0; i < listedIds.length; i++) {
//                     if (listedIds[i] == tokenId) {
//                         listedIds[i] = listedIds[listedIds.length - 1];
//                         listedIds.pop();
//                         break;
//                     }
//                 }

//                 ghost_canceledCount++;
//             } catch {
//                 // Ignore failures
//             }
//         }

//         vm.stopPrank();
//     }

//     function withdrawProceeds(uint256 actorSeed) public {
//         // Set up the actor
//         setActor(actorSeed);

//         // Only try to withdraw if actor has proceeds
//         if (proceeds[currentActor] > 0) {
//             uint256 expectedProceeds = proceeds[currentActor];
//             uint256 balanceBefore = currentActor.balance;

//             try marketplace.withdrawProceeds() {
//                 // Verify proceeds were received
//                 if (currentActor.balance >= balanceBefore + expectedProceeds) {
//                     proceeds[currentActor] = 0;
//                 }
//             } catch {
//                 // Ignore failures
//             }
//         }

//         vm.stopPrank();
//     }

//     function updateListingFee(uint256 newFee) public {
//         // Only owner can update listing fee
//         vm.startPrank(owner);

//         uint256 boundedFee = bound(newFee, 0, 0.1 ether);

//         try marketplace.updateListingFee(boundedFee) {
//             // Success
//         } catch {
//             // Ignore failures
//         }

//         vm.stopPrank();
//     }

//     function withdrawListingFees() public {
//         // Only owner can withdraw listing fees
//         vm.startPrank(owner);

//         try marketplace.withdrawListingFees() {
//             // Success
//         } catch {
//             // Ignore failures
//         }

//         vm.stopPrank();
//     }

//     // Invariant helper functions
//     function forEachMintedNFT(function(uint256) external func) public {
//         for (uint256 i = 0; i < mintedIds.length; i++) {
//             func(mintedIds[i]);
//         }
//     }

//     function forEachListedNFT(function(uint256) external func) public {
//         for (uint256 i = 0; i < listedIds.length; i++) {
//             func(listedIds[i]);
//         }
//     }

//     // Helper function for certain invariants
//     function getNFTOwner(uint256 tokenId) public view returns (address) {
//         return nftOwners[tokenId];
//     }

//     function getNFTPrice(uint256 tokenId) public view returns (uint256) {
//         return nftPrices[tokenId];
//     }

//     function getIsListed(uint256 tokenId) public view returns (bool) {
//         return isListed[tokenId];
//     }

//     function getProceeds(address user) public view returns (uint256) {
//         return proceeds[user];
//     }
// }