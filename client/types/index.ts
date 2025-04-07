import { ethers } from "ethers";

export interface NFTMetadata {
    name: string;
    description: string;
    image: string;
    attributes: string[];
  }
  
  export interface NFTListing {
    tokenId: number;
    price: ethers.BigNumberish;
    seller: string;
  }
  
  export interface NFT {
    tokenId: number;
    name: string;
    description: string;
    image: string;
    attributes: string[];
    owner: string;
    listing?: NFTListing;
  }