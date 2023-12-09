import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { constants as ethersConstants, Contract } from "ethers";
import { ethers } from "hardhat";

const mapping = {} as any;
mapping['tokenID'] = {price: 123, seller: 'seller'}
mapping['tokenID1'] = {price: 1, seller: 'seller'}
mapping['tokenID2'] = {price: 23, seller: 'seller'}

// When testing contract, we need to deploy it first
describe("NFTMarket", () => {
  let nftMarket: Contract;
  let signers: SignerWithAddress[];

  before(async () => {
    // Deploy the NFTMarket contract
    // pass the contract name into
    const NFTMarket = await ethers.getContractFactory('NFTMarket');
    nftMarket = await NFTMarket.deploy();
    await nftMarket.deployed();
    signers = await ethers.getSigners();
  });

  const createNFT = async (tokenURI: string) => {
    const transaction = await nftMarket.createNFT(tokenURI); // return the transaction object
    // console.log('transaction object: ', transaction);
    const receipt = await transaction.wait(); // wait for the transaction mined or validated from validators / miner
    // const args = receipt.events[0].args;
    // console.log('events: ', receipt.events);
    // console.log('args: ', args);
    // Assert that the newly created NFT's token uri is the same one sent to the createNFT function
    const tokenID = receipt.events[0].args.tokenId;
    return tokenID;
  }

  const createThenListNFT = async (price: number) => {
    const tokenID = await createNFT("some random uri");
    const transaction = await nftMarket.listNFT(tokenID, price);
    await transaction.wait();
    return tokenID;
  };


  describe("createNFT", () => {
    it('should create an NFT with the correct owner and tokenURI', async () => {
      // ex: triggered from frontend -> Call the create NFT function
      // These below code "like" that code frontend developers would write
      const tokenURI = "https://some-token.uri/";
      const transaction = await nftMarket.createNFT(tokenURI);
      const receipt = await transaction.wait(); // wait for the transaction to be mined and then returns a transaction receipt. 
      const tokenID = receipt.events[0].args.tokenId;
      const mintedTokenURI = await nftMarket.tokenURI(tokenID);
      expect(mintedTokenURI).to.equal(tokenURI);
  
      // Assert that the owner of the newly created NFT is the address that started the transaction
      const ownerAddress = await nftMarket.ownerOf(tokenID);
      const currentAddress = await signers[0].getAddress();
      expect(ownerAddress).to.equal(currentAddress);
      // Assert that NFTTransfer event has the correct args
      const args = receipt.events[1].args;
      expect(args.tokenID).to.equal(tokenID);
      expect(args.from).to.equal(ethersConstants.AddressZero);
      expect(args.to).to.equal(ownerAddress);
      expect(args.tokenURI).to.equal(tokenURI);
      expect(args.price).to.equal(0);
    })
  })


  describe("listNFT", () => {
      const tokenURI = 'some token URI'
      it("should revert if price is zero", async () => {
        const tokenID = await createNFT(tokenURI);
        const transaction = nftMarket.listNFT(tokenID, 0);
        await expect(transaction).to.be.revertedWith(
          "NFTMarket: price must be greater than 0"
        );
      });

    it("should revert if not called by the owner", async () => {
       const tokenID = await createNFT(tokenURI);
       const transaction = nftMarket.connect(signers[1]).listNFT(tokenID, 14); // simulate a different Ethereum address interacting with the contract
       await expect(transaction).to.be.revertedWith("ERC721: transfer caller is not owner nor approved")
     })

     it("should list the token for sale if all requirements are met", async () => {
      const price = 14;
      const tokenID = await createNFT(tokenURI);
      const transaction = await nftMarket.listNFT(tokenID, price); // simulate a different Ethereum address interacting with the contract
      const receipt = await transaction.wait();
      // Ownership should be transferred to the contract
      const ownerAddress = await nftMarket.ownerOf(tokenID);
      expect(ownerAddress).to.equal(nftMarket.address);
      // NFTTransfer event should have the right args
      const args = receipt.events[2].args; // object with tokenID, tokenURI, and price
      // checks whether the tokenID obtained from the event matches the original tokenID used to list the NFT
      expect(args.tokenID).to.equal(tokenID);
      // checks whether the to property 'to' in the event is equal to the address of the nftMarket contract (nftMarket.address)
      expect(args.to).to.equal(nftMarket.address);
      // checks whether tokenURI is equal to the empty string (list NFT function does not need to include tokenURI)
      expect(args.tokenURI).to.equal('');
      // checks whether 'price' in the event is equal to the our set price
      expect(args.price).to.equal(price);
      })
  })

  describe("buyNFT", () => {
    it("should revert if NFT is not listed for sale", async () => {
      const transaction = nftMarket.buyNFT(1414);
      await expect(transaction).to.be.revertedWith(
        "NFTMarket: NFT not listed for sale"
      );
    });

    it("should revert if the amount of wei sent is not equal to the NFT price", async () => {
      const tokenID = await createThenListNFT(167);
      const transaction = nftMarket.buyNFT(tokenID, { value: 144 });
      await expect(transaction).to.be.revertedWith(
        "NFTMarket: Incorrect price"
      );
    });

    it("should transfer ownership to the buyer and send the price to the seller", async () => {
      const price = 123;
      const sellerProfit = Math.round((price * 95) / 100);
      const fee = price - sellerProfit;
      const initialContractBalance = await nftMarket.provider.getBalance(
        nftMarket.address
      );
      const tokenID = await createThenListNFT(price); 
      await new Promise((r) => setTimeout(r, 100)); // after a transaction was mined, we need to wait a little bit before checking the balance of the signer, because it's not updated immediately
      const oldSellerBalance = await signers[0].getBalance();
      const transaction = await nftMarket
        .connect(signers[1])
        .buyNFT(tokenID, { value: price });
      const receipt = await transaction.wait();
      // 95% of the price was added to the seller balance
      await new Promise((r) => setTimeout(r, 100)); // need to wait a little bit before checking the new balance 
      const newSellerBalance = await signers[0].getBalance();
      const diff = newSellerBalance.sub(oldSellerBalance);
     
      expect(diff).to.equal(sellerProfit);
      // // 5% of the price was kept in the contract balance
      const newContractBalance = await nftMarket.provider.getBalance(
        nftMarket.address
      );
      const contractBalanceDiff = newContractBalance.sub(
        initialContractBalance
      );
      expect(contractBalanceDiff).to.equal(fee);
      // // NFT ownership was transferred to the buyer
      const ownerAddress = await nftMarket.ownerOf(tokenID);
      expect(ownerAddress).to.equal(signers[1].address);
      // // NFTTransfer event has the correct arguments
      const args = receipt.events[2].args;
      expect(args.tokenID).to.equal(tokenID);
      expect(args.from).to.equal(nftMarket.address);
      expect(args.to).to.equal(signers[1].address);
      expect(args.tokenURI).to.equal("");
      expect(args.price).to.equal(0);
    });
  })

  describe("cancelListing", () => {
    it("should revert if the NFT is not listed for sale", async () => {
      const transaction = nftMarket.cancelListing(9999);
      await expect(transaction).to.be.revertedWith(
        "NFTMarket: NFT not listed for sale"
      );
    });

    it("should revert if the caller is not the seller of the listing", async () => {
      const tokenID = await createThenListNFT(123);
      const transaction = nftMarket.connect(signers[1]).cancelListing(tokenID);
      await expect(transaction).to.be.revertedWith(
        "NFTMarket: You're not the seller"
      );
    });

    it("should transfer the ownership back to the seller if all requirements are met", async () => {
      const tokenID = await createThenListNFT(123);
      const transaction = await nftMarket.cancelListing(tokenID);
      const receipt = await transaction.wait();
      // Check ownership
      const ownerAddress = await nftMarket.ownerOf(tokenID);
      expect(ownerAddress).to.equal(signers[0].address);
      // Check NFTTransfer event
      const args = receipt.events[2].args;
      expect(args.tokenID).to.equal(tokenID);
      expect(args.from).to.equal(nftMarket.address);
      expect(args.to).to.equal(signers[0].address);
      expect(args.tokenURI).to.equal("");
      expect(args.price).to.equal(0);
    });
  });

  describe("withdrawFunds", () => {
    it("should revert if called by a signer other than the owner", async () => {
      const transaction = nftMarket.connect(signers[1]).withdrawFunds();
      await expect(transaction).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("should transfer all funds from the contract balance to the owner's", async () => {
      const contractBalance = await nftMarket.provider.getBalance(
        nftMarket.address
      );
      const initialOwnerBalance = await signers[0].getBalance();
      const transaction = await nftMarket.withdrawFunds();
      const receipt = await transaction.wait();

      await new Promise((r) => setTimeout(r, 100));
      const newOwnerBalance = await signers[0].getBalance();

      const gas = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      const transferred = newOwnerBalance.add(gas).sub(initialOwnerBalance);
      expect(transferred).to.equal(contractBalance);
    });

    it("should revert if contract balance is zero", async () => {
      const transaction = nftMarket.withdrawFunds();
      await expect(transaction).to.be.revertedWith(
        "NFTMarket: Balance is zero"
      );
    });
  });
})

