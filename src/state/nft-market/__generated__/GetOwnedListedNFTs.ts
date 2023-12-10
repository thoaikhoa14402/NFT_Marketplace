/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetOwnedListedNFTs
// ====================================================

export interface GetOwnedListedNFTs_nfts {
  __typename: "NFTTransfer";
  tokenID: string;
  from: any;
  to: any;
  tokenURI: string;
  price: any;
}

export interface GetOwnedListedNFTs {
  nfttransfers: GetOwnedListedNFTs_nfts[];
}

export interface GetOwnedListedNFTsVariables {
  owner: string;
}
