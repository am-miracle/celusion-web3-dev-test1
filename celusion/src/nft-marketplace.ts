import { Bytes } from "@graphprotocol/graph-ts"
import {
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
  BatchMetadataUpdate as BatchMetadataUpdateEvent,
  ListingFeeUpdated as ListingFeeUpdatedEvent,
  MetadataUpdate as MetadataUpdateEvent,
  NFTCanceled as NFTCanceledEvent,
  NFTListed as NFTListedEvent,
  NFTMinted as NFTMintedEvent,
  NFTSold as NFTSoldEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  ProceedsWithdrawn as ProceedsWithdrawnEvent,
  Transfer as TransferEvent
} from "../generated/NFTMarketplace/NFTMarketplace"
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
} from "../generated/schema"

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.approved = event.params.approved
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let entity = new ApprovalForAll(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.operator = event.params.operator
  entity.approved = event.params.approved

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBatchMetadataUpdate(
  event: BatchMetadataUpdateEvent
): void {
  let entity = new BatchMetadataUpdate(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._fromTokenId = event.params._fromTokenId
  entity._toTokenId = event.params._toTokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleListingFeeUpdated(event: ListingFeeUpdatedEvent): void {
  let entity = new ListingFeeUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldFee = event.params.oldFee
  entity.newFee = event.params.newFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMetadataUpdate(event: MetadataUpdateEvent): void {
  let entity = new MetadataUpdate(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._tokenId = event.params._tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNFTCanceled(event: NFTCanceledEvent): void {
  let entity = new NFTCanceled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenId = event.params.tokenId
  entity.seller = event.params.seller

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNFTListed(event: NFTListedEvent): void {
  let entity = new NFTListed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenId = event.params.tokenId
  entity.seller = event.params.seller
  entity.price = event.params.price

  let mintedNFTId = Bytes.fromByteArray(
    Bytes.fromBigInt(event.params.tokenId)
  );
  
  let mintedNFT = NFTMinted.load(mintedNFTId);
  
  if (mintedNFT) {
    entity.tokenURI = mintedNFT.tokenURI;
  }

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNFTMinted(event: NFTMintedEvent): void {
  let id = Bytes.fromByteArray(
    Bytes.fromBigInt(event.params.tokenId)
  );
  
  let entity = new NFTMinted(id);
  entity.tokenId = event.params.tokenId
  entity.owner = event.params.owner
  entity.tokenURI = event.params.tokenURI

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNFTSold(event: NFTSoldEvent): void {
  let entity = new NFTSold(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenId = event.params.tokenId
  entity.seller = event.params.seller
  entity.buyer = event.params.buyer
  entity.price = event.params.price

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProceedsWithdrawn(event: ProceedsWithdrawnEvent): void {
  let entity = new ProceedsWithdrawn(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.seller = event.params.seller
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
