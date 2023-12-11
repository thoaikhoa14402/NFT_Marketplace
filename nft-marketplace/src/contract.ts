import {
  NFTTransfer as NFTTransferEvent,
} from "../generated/Contract/Contract"

import {
  NFTTransfer,
} from "../generated/schema"

import {
  Bytes,
} from "@graphprotocol/graph-ts";

import {
  Contract
} from "../generated/Contract/Contract"

function stringToBytes(inputString: string): Bytes {
  let bytesValue: Bytes = Bytes.fromUTF8(inputString);
  
  return bytesValue;
}

export function handleNFTTransfer(event: NFTTransferEvent): void {
  let entity = new NFTTransfer(stringToBytes(event.params.tokenID.toString()))
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