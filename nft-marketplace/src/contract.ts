import {
  NFTTransfer as NFTTransferEvent,
} from "../generated/Contract/Contract"

import {
  NFTTransfer,
} from "../generated/schema"

import {
  Contract
} from "../generated/Contract/Contract"

export function handleNFTTransfer(event: NFTTransferEvent): void {
  let entity = new NFTTransfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenID = event.params.tokenID
  entity.from = event.params.from
  entity.to = event.params.to
  
  const nftMarket = Contract.bind(event.address);
  entity.tokenURI = nftMarket.tokenURI(event.params.tokenID)
  entity.price = event.params.price

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}