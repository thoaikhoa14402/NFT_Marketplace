import classNames from "classnames";
import { BigNumber } from "ethers";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useNFTMarket from "state/nft-market";
import { NFTTransfer } from "state/nft-market/interfaces";
import useSigner from "state/signer";
import { ipfsToHTTPS } from "../helpers";
import AddressAvatar from "./AddressAvatar";
import SellPopup from "./SellPopup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEthereum } from "@fortawesome/free-brands-svg-icons";

type NFTMetadata = {
  name: string;
  description: string;
  imageURL: string;
};

type NFTCardProps = {
  nft: NFTTransfer;
  className?: string;
};

const NFTCard = (props: NFTCardProps) => {
  const { nft, className } = props;
  const { address } = useSigner();
  const { listNFT, cancelListing, buyNFT } = useNFTMarket();
  const router = useRouter();
  const [meta, setMeta] = useState<NFTMetadata>();
  const [loading, setLoading] = useState(false);
  const [sellPopupOpen, setSellPopupOpen] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      const metadataResponse = await fetch(ipfsToHTTPS(nft.tokenURI));
      if (metadataResponse.status != 200) return;
      const json = await metadataResponse.json();
      setMeta({
        name: json.name,
        description: json.description,
        imageURL: ipfsToHTTPS(json.image),
      });
    };
    void fetchMetadata();
  }, [nft.tokenURI]);

  const showErrorToast = () => toast.warn("Something wrong!");

  const onButtonClick = async () => {
    if (owned) {
      if (forSale) onCancelClicked();
      else setSellPopupOpen(true);
    } else {
      if (forSale) onBuyClicked();
      else {
        throw new Error(
          "onButtonClick called when NFT is not owned and is not listed, should never happen"
        );
      }
    }
  };

  const onBuyClicked = async () => {
    setLoading(true);
    try {
      await buyNFT(nft);
      router.push("/owned");
      toast.success(
        "You collection will be updated shortly! Refresh the page."
      );
    } catch (e) {
      showErrorToast();
      console.log(e);
    }
    setLoading(false);
  };

  const onCancelClicked = async () => {
    setLoading(true);
    try {
      await cancelListing(nft.tokenID);
      toast.success(
        "You canceled this listing. Changes will be reflected shortly."
      );
    } catch (e) {
      showErrorToast();
      console.log(e);
    }
    setLoading(false);
  };

  const onSellConfirmed = async (price: BigNumber) => {
    setSellPopupOpen(false);
    setLoading(true);
    console.log(nft);
    try {
      await listNFT(nft.tokenID, price);
      toast.success(
        "You listed this NFT for sale. Changes will be reflected shortly."
      );
    } catch (e) {
      showErrorToast();
      console.log(e);
    }
    setLoading(false);
  };

  const forSale = nft.price != "0";
  const owned = nft.owner == address?.toLowerCase();

  return (
    <div
      className={classNames(
        "flex w-80 flex-shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 p-4 font-semibold gap-2 ",
        className
      )}
    >
      <div className="mx-auto h-44 w-full overflow-hidden rounded-md border border-gray-100">
        {meta ? (
          <img
            src={meta?.imageURL}
            alt={meta?.name}
            className="h-full w-full object-contain object-center transition-all duration-300 ease-in-out hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            loading...
          </div>
        )}
      </div>
      <div className="rounded-md">
        <div className="flex flex-col gap-2 py-3 pb-0">
          <p className="text-md text-center">{meta?.name ?? "..."}</p>
          <span className="text-xs font-normal border-b py-3 pt-0">
            {meta?.description ?? "..."}
          </span>
          <div className="flex items-center justify-between py-3 font-medium bg-slate-50 px-4 rounded-md">
            <AddressAvatar address={nft.owner} />
            <span>
              {forSale && (
                <span className="text-sm flex gap-2 items-center">
                  {nft.price} <FontAwesomeIcon icon={faEthereum} />
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
      <button
          className="group flex h-12 items-center justify-center rounded-md bg-primary text-lg font-semibold text-white w-full transition-all duration-200 hover:bg-opacity-90"
          onClick={onButtonClick}
          disabled={loading}
        >
          {loading && "Busy..."}
          {!loading && (
            <>
              {!forSale && "SELL"}
              {forSale && owned && (
                <span>CANCEL</span>
              )}
              {forSale && !owned && (
                <span>BUY</span>
              )}
            </>
          )}
        </button>
      <SellPopup
        open={sellPopupOpen}
        onClose={() => setSellPopupOpen(false)}
        onSubmit={onSellConfirmed}
      />
    </div>
  );
};

export default NFTCard;
