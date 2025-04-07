// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Imports
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";


/**
 * @title NFT Marketplace
 * @notice This contract implements a decentralized NFT marketplace
 * @dev Extends ERC721URIStorage for NFT functionality and ReentrancyGuard for security
 */
contract NFTMarketplace is ERC721URIStorage, ReentrancyGuard, Ownable {
    // Errors
    error NFTMarketplace__PriceMustBeAboveZero();
    error NFTMarketplace__NotOwner();
    error NFTMarketplace__NotListed();
    error NFTMarketplace__AlreadyListed();
    error NFTMarketplace__NotEnoughFunds();
    error NFTMarketplace__TransferFailed();
    error NFTMarketplace__NotApprovedForMarketplace();

    // Type declarations
    struct NFTListing {
        uint256 price;
        address seller;
    }

    struct NFTMetadata {
        string name;
        string description;
        string image;
        string attributes;
    }

    // State variables
    uint256 private _tokenIdCounter;
    uint256 private _listingFee;
    mapping(uint256 => NFTListing) private _listings;
    mapping(address => uint256) private _proceeds;

    // Events
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string tokenURI
    );

    event NFTListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );

    event NFTSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );

    event NFTCanceled(
        uint256 indexed tokenId,
        address indexed seller
    );

    event ProceedsWithdrawn(
        address indexed seller,
        uint256 amount
    );

    event ListingFeeUpdated(
        uint256 oldFee,
        uint256 newFee
    );

    // Modifiers
    modifier isOwnerOf(uint256 tokenId) {
        if (ownerOf(tokenId) != msg.sender) {
            revert NFTMarketplace__NotOwner();
        }
        _;
    }

    modifier isListed(uint256 tokenId) {
        if (_listings[tokenId].price <= 0) {
            revert NFTMarketplace__NotListed();
        }
        _;
    }

    modifier notListed(uint256 tokenId) {
        if (_listings[tokenId].price > 0) {
            revert NFTMarketplace__AlreadyListed();
        }
        _;
    }

    // Functions
    /**
     * @dev Constructor to initialize the NFT marketplace
     * @param marketplaceName Name of the marketplace
     * @param marketplaceSymbol Symbol for the marketplace's NFTs
     * @param listingFee Fee to list NFTs on the marketplace
     */
    constructor(
        string memory marketplaceName,
        string memory marketplaceSymbol,
        uint256 listingFee
    ) ERC721(marketplaceName, marketplaceSymbol) Ownable(msg.sender) {
        _listingFee = listingFee;
    }

    /**
     * @notice Allows users to mint an NFT with custom metadata
     * @param name Name of the NFT
     * @param description Description of the NFT
     * @param image URL or base64 encoded image
     * @param attributes JSON string of attributes
     * @return tokenId of the newly minted NFT
     */
    function mintNFT(
        string memory name,
        string memory description,
        string memory image,
        string memory attributes
    ) external returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        
        _safeMint(msg.sender, tokenId);
        
        NFTMetadata memory metadata = NFTMetadata({
            name: name,
            description: description,
            image: image,
            attributes: attributes
        });
        
        string memory tokenURI = _generateTokenURI(metadata);
        _setTokenURI(tokenId, tokenURI);
        
        emit NFTMinted(tokenId, msg.sender, tokenURI);
        
        return tokenId;
    }

    /**
     * @notice Lists an NFT on the marketplace
     * @param tokenId ID of the NFT to list
     * @param price Price in wei for the NFT
     */
    function listNFT(uint256 tokenId, uint256 price) external payable
        isOwnerOf(tokenId)
        notListed(tokenId)
        nonReentrant
    {
        if (price <= 0) {
            revert NFTMarketplace__PriceMustBeAboveZero();
        }
        
        if (msg.value < _listingFee) {
            revert NFTMarketplace__NotEnoughFunds();
        }
        
        if (getApproved(tokenId) != address(this)) {
            revert NFTMarketplace__NotApprovedForMarketplace();
        }
        _listings[tokenId] = NFTListing({
            price: price,
            seller: msg.sender
        });
        
        emit NFTListed(tokenId, msg.sender, price);
    }

    /**
     * @notice Allows a user to buy a listed NFT
     * @param tokenId ID of the NFT to purchase
     */
    function buyNFT(uint256 tokenId) external payable
        isListed(tokenId)
        nonReentrant
    {
        NFTListing memory listing = _listings[tokenId];
        
        if (msg.value < listing.price) {
            revert NFTMarketplace__NotEnoughFunds();
        }
        
        // Update proceeds for the seller
        _proceeds[listing.seller] += msg.value;
        
        // Remove the listing
        delete _listings[tokenId];
        
        // Transfer ownership of the NFT
        _transfer(listing.seller, msg.sender, tokenId);
        
        emit NFTSold(tokenId, listing.seller, msg.sender, listing.price);
    }

    /**
     * @notice Cancels an NFT listing
     * @param tokenId ID of the NFT to cancel listing
     */
    function cancelListing(uint256 tokenId) external
        isOwnerOf(tokenId)
        isListed(tokenId)
        nonReentrant
    {
        delete _listings[tokenId];
        emit NFTCanceled(tokenId, msg.sender);
    }

    /**
     * @notice Allows sellers to withdraw their proceeds
     */
    function withdrawProceeds() external nonReentrant {
        uint256 proceeds = _proceeds[msg.sender];

        if (proceeds <= 0) {
            revert NFTMarketplace__NotEnoughFunds();
        }

        // Reset proceeds before transfer to prevent reentrancy
        _proceeds[msg.sender] = 0;

        // Transfer the proceeds
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        if (!success) {
            revert NFTMarketplace__TransferFailed();
        }

        emit ProceedsWithdrawn(msg.sender, proceeds);
    }

    /**
     * @notice Update the listing fee
     * @param newListingFee New fee for listing NFTs
     */
    function updateListingFee(uint256 newListingFee) external onlyOwner {
        uint256 oldFee = _listingFee;
        _listingFee = newListingFee;
        emit ListingFeeUpdated(oldFee, newListingFee);
    }

    /**
     * @notice Withdraw listing fees to the contract owner
     */
    function withdrawListingFees() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        if (!success) {
            revert NFTMarketplace__TransferFailed();
        }
    }

    // View & Pure Functions
    /**
     * @notice Gets the listing for a specific NFT
     * @param tokenId ID of the NFT
     * @return price Price of the listing
     * @return seller Address of the seller
     */
    function getListing(uint256 tokenId) external view returns (uint256 price, address seller) {
        NFTListing memory listing = _listings[tokenId];
        return (listing.price, listing.seller);
    }

    /**
     * @notice Gets the proceeds available for withdrawal by an address
     * @param seller Address of the seller
     * @return Amount of proceeds available
     */
    function getProceeds(address seller) external view returns (uint256) {
        return _proceeds[seller];
    }

    /**
     * @notice Gets the current listing fee
     * @return Current listing fee
     */
    function getListingFee() external view returns (uint256) {
        return _listingFee;
    }

    /**
     * @notice Checks if an NFT is currently listed
     * @param tokenId ID of the NFT
     * @return Whether the NFT is listed
     */
    function isNFTListed(uint256 tokenId) external view returns (bool) {
        return _listings[tokenId].price > 0;
    }

    /**
     * @notice Gets the total number of NFTs minted
     * @return Total number of NFTs
     */
    function getTotalNFTs() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Generates a token URI from metadata
     * @param metadata Struct containing the NFT metadata
     * @return Base64 encoded JSON metadata
     */
    function _generateTokenURI(NFTMetadata memory metadata) internal pure returns (string memory) {
        bytes memory jsonBytes = abi.encodePacked(
            '{"name":"', metadata.name, '",',
            '"description":"', metadata.description, '",',
            '"image":"', metadata.image, '",',
            '"attributes":', metadata.attributes, '}'
        );
        
        string memory json = string(jsonBytes);
        string memory encodedJson = Base64.encode(bytes(json));
        
        return string(abi.encodePacked("data:application/json;base64,", encodedJson));
    }
}