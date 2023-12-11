import EmptyState from "components/EmptyState";
import NFTCard from "components/NFTCard";
import useNFTMarket from "state/nft-market";
import useSigner from "state/signer";

const HomePage = () => {
  const { signer } = useSigner();
  const { showlisted } = useNFTMarket();

  const notConnected = !signer;
  const loading = !showlisted;
  const empty = showlisted && showlisted.length == 0;
  const loaded = showlisted && showlisted.length > 0;

  return (
    <div className="flex w-full flex-col">
      {/* {notConnected && <EmptyState>Connect your wallet</EmptyState>} */}
      {loading && <EmptyState>Loading...</EmptyState>}
      {empty && <EmptyState>Nothing to show here</EmptyState>}
      {loaded && (
        <div className="flex flex-wrap">
          {showlisted?.map((nft) => (
            <NFTCard nft={nft} className="mr-2 mb-2" key={nft.tokenID} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
