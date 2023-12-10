import { ethers } from "ethers";
import { NFTTransfer } from "./interfaces";
import { GetOwnedNFTs_nfts } from "./__generated__/GetOwnedNFTs";

export const parseRawNFT = (raw: GetOwnedNFTs_nfts): NFTTransfer => {
  return {
    tokenID: raw.tokenID,
    owner: raw.price == "0" ? raw.to : raw.from,
    price: raw.price == "0" ? "0" : ethers.utils.formatEther(raw.price),
    tokenURI: raw.tokenURI,
  };
};
