import { gql, useQuery } from "@apollo/client";
import useSigner from "state/signer";
import { parseRawNFT } from "./helpers";
import {
  GetOwnedNFTs,
  GetOwnedNFTsVariables,
} from "./__generated__/GetOwnedNFTs";

const useOwnedNFTs = () => {
  const { address } = useSigner();

  const { data } = useQuery<GetOwnedNFTs, GetOwnedNFTsVariables>(
    GET_OWNED_NFTS,
    { variables: { owner: address ?? "" }, skip: !address }
  );
  const ownedNFTs = data?.nfttransfers.map(parseRawNFT);
  return { ownedNFTs };
};

const GET_OWNED_NFTS = gql`
  query GetOwnedNFTs($owner: String!) {
    nfttransfers(where: { to: $owner }) {
      tokenID
      from
      to
      tokenURI
      price
    }
  }
`;

export default useOwnedNFTs;
