import { DocumentNode, gql } from "@apollo/client";

export const GET_MINTED_NFTS: DocumentNode = gql`
  query GetAllMintedNFTs($first: Int!, $skip: Int!) {
    nftminteds(first: $first, orderBy: blockTimestamp, orderDirection: desc, skip: $skip) {
      id
      owner
      tokenId
      tokenURI
      blockTimestamp
    }
  }
`;


// export const GET_LISTED_NFTS: DocumentNode = gql`
//     query GetAllListings($first: Int!, $skip: Int!) {
//       nftlisteds(first: $first, orderBy: blockTimestamp, orderDirection: desc, skip: $skip) {
//         id
//         tokenId
//         seller
//         price
//         tokenURI
//         blockTimestamp
//       }
//     }
// `;

export const GET_LISTED_NFTS: DocumentNode = gql`
    query GetAllListings($first: Int!, $skip: Int!) {
      activeListings(first: $first, orderDirection: desc, skip: $skip) {
        id
        tokenId
        seller
        price
        tokenURI
      }
    }
`;


export const GET_SOLD_NFTS: DocumentNode = gql`
  query GetAllSales {
    nftSolds(first: 100, orderBy: timestamp, orderDirection: desc) {
        id
        tokenId
        seller
        buyer
        price
        timestamp
    }
  }
`;

export const GET_CANCELED_LISTINGS: DocumentNode = gql`
  query GetAllCanceledListings {
    nftCanceleds(first: 100, orderBy: timestamp, orderDirection: desc) {
        id
        tokenId
        seller
        timestamp
    }
  }
`;

export const GET_PROCEEDS_WITHDRAWN: DocumentNode = gql`
  query GetProceedsWithdrawn {
    proceedsWithdrawns(first: 100, orderBy: timestamp, orderDirection: desc) {
        id
        seller
        amount
        timestamp
    }
  }
`;

export const GET_LISTING_FEE_CHANGES: DocumentNode = gql`
    query GetListingFeeChanges {
        listingFeeUpdateds(first: 100, orderBy: timestamp, orderDirection: desc) {
            id
            oldFee
            newFee
            timestamp
        }
    }
`;

export const GET_PURCHASES_BY_BUYER: DocumentNode = gql`
    query GetPurchasesByBuyer($buyer: Bytes!) {
        nftSolds(where: {buyer: $buyer}) {
            id
            tokenId
            seller
            price
            timestamp
        }
    }
`;