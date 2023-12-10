import { TransactionResponse } from "@ethersproject/abstract-provider";
import { BigNumber, Contract, ethers } from "ethers";
import { CreationValues } from "modules/CreationPage/CreationForm";
import useSigner from "state/signer";
import NFT_MARKET from "../../../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import { NFT_MARKET_ADDRESS } from "./config";
import { NFTTransfer } from "./interfaces";
import useListedNFTs from "./useListedNFTs";
import useOwnedListedNFTs from "./useOwnedListedNFTs";
import useOwnedNFTs from "./useOwnedNFTs";
import axios from "axios";

const useNFTMarket = () => {
  const { signer } = useSigner();
  const nftMarket = new Contract(NFT_MARKET_ADDRESS, NFT_MARKET.abi, signer);

  const ownedNFTs = useOwnedNFTs();
  const ownedListedNFTs = useOwnedListedNFTs();
  const listedNFTs = useListedNFTs();

  const createNFT = async (values: CreationValues) => {
    try {
      const data = new FormData();
      data.append("name", values.name);
      data.append("description", values.description);
      data.append("image", values.image!);
      const response = await axios.post("/api/nft-storage", data);

      if (response.status == 201) {
        const json = await response.data;

        console.log(json);

        const transaction: TransactionResponse = await nftMarket.createNFT(
          json.uri
        );
        await transaction.wait();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const listNFT = async (tokenID: string, price: BigNumber) => {
    const transaction: TransactionResponse = await nftMarket.listNFT(
      tokenID,
      price
    );
    await transaction.wait();
  };

  const cancelListing = async (tokenID: string) => {
    const transaction: TransactionResponse = await nftMarket.cancelListing(
      tokenID
    );
    await transaction.wait();
  };

  const buyNFT = async (nft: NFTTransfer) => {
    const transaction: TransactionResponse = await nftMarket.buyNFT(nft.tokenID, {
      value: ethers.utils.parseEther(nft.price),
    });
    await transaction.wait();
  };

  return {
    createNFT,
    listNFT,
    cancelListing,
    buyNFT,
    ...ownedNFTs,
    ...ownedListedNFTs,
    ...listedNFTs,
  };
};

export default useNFTMarket;
