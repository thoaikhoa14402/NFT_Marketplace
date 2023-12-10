/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetOwnedNFTs
// ====================================================

export interface GetOwnedNFTs_nfts {
  __typename: "NFTTransfer";
  tokenID: string;
  from: any;
  to: any;
  tokenURI: string;
  price: any;
}

export interface GetOwnedNFTs {
  nfttransfers: GetOwnedNFTs_nfts[];
}

export interface GetOwnedNFTsVariables {
  owner: string;
}
