import { type ethers } from 'ethers';

export const MARKETPLACE_ADDRESS = "0xeAA57c46cE1D692De22d122b4f94c9676A3a7Ac8" as string;

export const MARKETPLACE_ABI = [
    {
      "type": "constructor",
      "inputs": [
        { "name": "marketplaceName", "type": "string", "internalType": "string" },
        {
          "name": "marketplaceSymbol",
          "type": "string",
          "internalType": "string"
        },
        { "name": "listingFee", "type": "uint256", "internalType": "uint256" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "approve",
      "inputs": [
        { "name": "to", "type": "address", "internalType": "address" },
        { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "balanceOf",
      "inputs": [
        { "name": "owner", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "buyNFT",
      "inputs": [
        { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "cancelListing",
      "inputs": [
        { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "getApproved",
      "inputs": [
        { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getListing",
      "inputs": [
        { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        { "name": "price", "type": "uint256", "internalType": "uint256" },
        { "name": "seller", "type": "address", "internalType": "address" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getListingFee",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getProceeds",
      "inputs": [
        { "name": "seller", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getTotalNFTs",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "isApprovedForAll",
      "inputs": [
        { "name": "owner", "type": "address", "internalType": "address" },
        { "name": "operator", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "isNFTListed",
      "inputs": [
        { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "listNFT",
      "inputs": [
        { "name": "tokenId", "type": "uint256", "internalType": "uint256" },
        { "name": "price", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "mintNFT",
      "inputs": [
        { "name": "name", "type": "string", "internalType": "string" },
        { "name": "description", "type": "string", "internalType": "string" },
        { "name": "image", "type": "string", "internalType": "string" },
        { "name": "attributes", "type": "string", "internalType": "string" }
      ],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "name",
      "inputs": [],
      "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "owner",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "ownerOf",
      "inputs": [
        { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "renounceOwnership",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "safeTransferFrom",
      "inputs": [
        { "name": "from", "type": "address", "internalType": "address" },
        { "name": "to", "type": "address", "internalType": "address" },
        { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "safeTransferFrom",
      "inputs": [
        { "name": "from", "type": "address", "internalType": "address" },
        { "name": "to", "type": "address", "internalType": "address" },
        { "name": "tokenId", "type": "uint256", "internalType": "uint256" },
        { "name": "data", "type": "bytes", "internalType": "bytes" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "setApprovalForAll",
      "inputs": [
        { "name": "operator", "type": "address", "internalType": "address" },
        { "name": "approved", "type": "bool", "internalType": "bool" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "supportsInterface",
      "inputs": [
        { "name": "interfaceId", "type": "bytes4", "internalType": "bytes4" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "symbol",
      "inputs": [],
      "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "tokenURI",
      "inputs": [
        { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "transferFrom",
      "inputs": [
        { "name": "from", "type": "address", "internalType": "address" },
        { "name": "to", "type": "address", "internalType": "address" },
        { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "transferOwnership",
      "inputs": [
        { "name": "newOwner", "type": "address", "internalType": "address" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "updateListingFee",
      "inputs": [
        { "name": "newListingFee", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "withdrawListingFees",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "withdrawProceeds",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "event",
      "name": "Approval",
      "inputs": [
        {
          "name": "owner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "approved",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "tokenId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "ApprovalForAll",
      "inputs": [
        {
          "name": "owner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "operator",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "approved",
          "type": "bool",
          "indexed": false,
          "internalType": "bool"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "BatchMetadataUpdate",
      "inputs": [
        {
          "name": "_fromTokenId",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "_toTokenId",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "ListingFeeUpdated",
      "inputs": [
        {
          "name": "oldFee",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "newFee",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "MetadataUpdate",
      "inputs": [
        {
          "name": "_tokenId",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "NFTCanceled",
      "inputs": [
        {
          "name": "tokenId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "seller",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "NFTListed",
      "inputs": [
        {
          "name": "tokenId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "seller",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "price",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "NFTMinted",
      "inputs": [
        {
          "name": "tokenId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "owner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "tokenURI",
          "type": "string",
          "indexed": false,
          "internalType": "string"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "NFTSold",
      "inputs": [
        {
          "name": "tokenId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "seller",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "buyer",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "price",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "OwnershipTransferred",
      "inputs": [
        {
          "name": "previousOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "newOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "ProceedsWithdrawn",
      "inputs": [
        {
          "name": "seller",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "Transfer",
      "inputs": [
        {
          "name": "from",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "to",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "tokenId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "error",
      "name": "ERC721IncorrectOwner",
      "inputs": [
        { "name": "sender", "type": "address", "internalType": "address" },
        { "name": "tokenId", "type": "uint256", "internalType": "uint256" },
        { "name": "owner", "type": "address", "internalType": "address" }
      ]
    },
    {
      "type": "error",
      "name": "ERC721InsufficientApproval",
      "inputs": [
        { "name": "operator", "type": "address", "internalType": "address" },
        { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
      ]
    },
    {
      "type": "error",
      "name": "ERC721InvalidApprover",
      "inputs": [
        { "name": "approver", "type": "address", "internalType": "address" }
      ]
    },
    {
      "type": "error",
      "name": "ERC721InvalidOperator",
      "inputs": [
        { "name": "operator", "type": "address", "internalType": "address" }
      ]
    },
    {
      "type": "error",
      "name": "ERC721InvalidOwner",
      "inputs": [
        { "name": "owner", "type": "address", "internalType": "address" }
      ]
    },
    {
      "type": "error",
      "name": "ERC721InvalidReceiver",
      "inputs": [
        { "name": "receiver", "type": "address", "internalType": "address" }
      ]
    },
    {
      "type": "error",
      "name": "ERC721InvalidSender",
      "inputs": [
        { "name": "sender", "type": "address", "internalType": "address" }
      ]
    },
    {
      "type": "error",
      "name": "ERC721NonexistentToken",
      "inputs": [
        { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
      ]
    },
    { "type": "error", "name": "NFTMarketplace__AlreadyListed", "inputs": [] },
    {
      "type": "error",
      "name": "NFTMarketplace__NotApprovedForMarketplace",
      "inputs": []
    },
    { "type": "error", "name": "NFTMarketplace__NotEnoughFunds", "inputs": [] },
    { "type": "error", "name": "NFTMarketplace__NotListed", "inputs": [] },
    { "type": "error", "name": "NFTMarketplace__NotOwner", "inputs": [] },
    {
      "type": "error",
      "name": "NFTMarketplace__PriceMustBeAboveZero",
      "inputs": []
    },
    { "type": "error", "name": "NFTMarketplace__TransferFailed", "inputs": [] },
    {
      "type": "error",
      "name": "OwnableInvalidOwner",
      "inputs": [
        { "name": "owner", "type": "address", "internalType": "address" }
      ]
    },
    {
      "type": "error",
      "name": "OwnableUnauthorizedAccount",
      "inputs": [
        { "name": "account", "type": "address", "internalType": "address" }
      ]
    },
    { "type": "error", "name": "ReentrancyGuardReentrantCall", "inputs": [] }
  ]   as const;

export type NFTMarketplaceContract = ethers.Contract;
