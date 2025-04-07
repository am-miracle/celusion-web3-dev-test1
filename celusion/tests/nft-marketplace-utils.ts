import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Approval,
  ApprovalForAll,
  BatchMetadataUpdate,
  ListingFeeUpdated,
  MetadataUpdate,
  NFTCanceled,
  NFTListed,
  NFTMinted,
  NFTSold,
  OwnershipTransferred,
  ProceedsWithdrawn,
  Transfer
} from "../generated/NFTMarketplace/NFTMarketplace"

export function createApprovalEvent(
  owner: Address,
  approved: Address,
  tokenId: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent())

  approvalEvent.parameters = new Array()

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromAddress(approved))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return approvalEvent
}

export function createApprovalForAllEvent(
  owner: Address,
  operator: Address,
  approved: boolean
): ApprovalForAll {
  let approvalForAllEvent = changetype<ApprovalForAll>(newMockEvent())

  approvalForAllEvent.parameters = new Array()

  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  )

  return approvalForAllEvent
}

export function createBatchMetadataUpdateEvent(
  _fromTokenId: BigInt,
  _toTokenId: BigInt
): BatchMetadataUpdate {
  let batchMetadataUpdateEvent = changetype<BatchMetadataUpdate>(newMockEvent())

  batchMetadataUpdateEvent.parameters = new Array()

  batchMetadataUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "_fromTokenId",
      ethereum.Value.fromUnsignedBigInt(_fromTokenId)
    )
  )
  batchMetadataUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "_toTokenId",
      ethereum.Value.fromUnsignedBigInt(_toTokenId)
    )
  )

  return batchMetadataUpdateEvent
}

export function createListingFeeUpdatedEvent(
  oldFee: BigInt,
  newFee: BigInt
): ListingFeeUpdated {
  let listingFeeUpdatedEvent = changetype<ListingFeeUpdated>(newMockEvent())

  listingFeeUpdatedEvent.parameters = new Array()

  listingFeeUpdatedEvent.parameters.push(
    new ethereum.EventParam("oldFee", ethereum.Value.fromUnsignedBigInt(oldFee))
  )
  listingFeeUpdatedEvent.parameters.push(
    new ethereum.EventParam("newFee", ethereum.Value.fromUnsignedBigInt(newFee))
  )

  return listingFeeUpdatedEvent
}

export function createMetadataUpdateEvent(_tokenId: BigInt): MetadataUpdate {
  let metadataUpdateEvent = changetype<MetadataUpdate>(newMockEvent())

  metadataUpdateEvent.parameters = new Array()

  metadataUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "_tokenId",
      ethereum.Value.fromUnsignedBigInt(_tokenId)
    )
  )

  return metadataUpdateEvent
}

export function createNFTCanceledEvent(
  tokenId: BigInt,
  seller: Address
): NFTCanceled {
  let nftCanceledEvent = changetype<NFTCanceled>(newMockEvent())

  nftCanceledEvent.parameters = new Array()

  nftCanceledEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  nftCanceledEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )

  return nftCanceledEvent
}

export function createNFTListedEvent(
  tokenId: BigInt,
  seller: Address,
  price: BigInt
): NFTListed {
  let nftListedEvent = changetype<NFTListed>(newMockEvent())

  nftListedEvent.parameters = new Array()

  nftListedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  nftListedEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )
  nftListedEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )

  return nftListedEvent
}

export function createNFTMintedEvent(
  tokenId: BigInt,
  owner: Address,
  tokenURI: string
): NFTMinted {
  let nftMintedEvent = changetype<NFTMinted>(newMockEvent())

  nftMintedEvent.parameters = new Array()

  nftMintedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  nftMintedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  nftMintedEvent.parameters.push(
    new ethereum.EventParam("tokenURI", ethereum.Value.fromString(tokenURI))
  )

  return nftMintedEvent
}

export function createNFTSoldEvent(
  tokenId: BigInt,
  seller: Address,
  buyer: Address,
  price: BigInt
): NFTSold {
  let nftSoldEvent = changetype<NFTSold>(newMockEvent())

  nftSoldEvent.parameters = new Array()

  nftSoldEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  nftSoldEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )
  nftSoldEvent.parameters.push(
    new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer))
  )
  nftSoldEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )

  return nftSoldEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createProceedsWithdrawnEvent(
  seller: Address,
  amount: BigInt
): ProceedsWithdrawn {
  let proceedsWithdrawnEvent = changetype<ProceedsWithdrawn>(newMockEvent())

  proceedsWithdrawnEvent.parameters = new Array()

  proceedsWithdrawnEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )
  proceedsWithdrawnEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return proceedsWithdrawnEvent
}

export function createTransferEvent(
  from: Address,
  to: Address,
  tokenId: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return transferEvent
}
