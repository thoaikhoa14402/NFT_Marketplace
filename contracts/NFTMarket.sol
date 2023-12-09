// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

struct NFTListing {
    uint256 price;
    address payable seller;
}

contract NFTMarket is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    mapping(uint256 => NFTListing) private _listings;
    using SafeMath for uint256;

    // Define custom events
    // note: if tokenURI is not an empty string => an NFT was created
    // note: if price is not 0 => an NFT was listed
    // note: if price is 0 && token URI is an empty string => NFT was transferred (either bought, or the listing was canceled)

    event NFTTransfer(
        uint256 tokenID,
        address from,
        address to,
        string tokenURI,
        uint256 price
    );

    // pass the name and symbol
    //  who deploy the contract first time will be the owner
    constructor() ERC721("BasicNFT", "BNFT") {}

    // Hàm receive chỉ nhận Ether mà không thực hiện xử lý khác
    receive() external payable {
        // Nothing
    }

    // Create NFT
    function createNFT(string calldata tokenURI) public {
        uint256 tokenID = ++_nextTokenId;
        // Step 1. Mint a new nft.
        //     This _safeMint function take 2 arguments: the first argument is the address which we want to mint nft to, the second argument is tokenID
        //     -> We mint the token to the person who is calling this function => so we use msg, a global variable that holds information about the current transction
        //     -> Mint the token for who sent the transaction
        _safeMint(msg.sender, tokenID);
        // Step 2. Set token URI for our NFT
        _setTokenURI(tokenID, tokenURI);
        // Step 3. Emit event nft transfer
        emit NFTTransfer(tokenID, address(0), msg.sender, tokenURI, 0);
    }

    // List NFT
    function listNFT(uint256 tokenID, uint256 price) public {
        // Step 1. Check the price value is negative or not
        require(price > 0, "NFTMarket: price must be greater than 0");
        // Step 2. Allow this contract to transfer this token ownership (library do for us)
        // If 2 above steps passed, then we go to step 3
        // Step 3. Transfer the token ownership to the market (NFT Market contract)
        transferFrom(msg.sender, address(this), tokenID);
        _listings[tokenID] = NFTListing(price, payable(msg.sender));
        // Step 4. Emit event nft transfer
        emit NFTTransfer(tokenID, msg.sender, address(this), "", price);
    }

    // Buy NFT
    function buyNFT(uint256 tokenID) public payable {
        // Step 1. Get the listing NFT
        NFTListing memory listing = _listings[tokenID];
        // Step 2. Check the price of listing NFT is negative or not d -> If the price is not > 0, it means that NFT is not listing yet or having invalid price
        require(listing.price > 0, "NFTMarket: NFT not listed for sale");
        // Step 3. Check whether the submitted purchase price of the transaction meets the eligibility criteria for acquiring the listed NFT
        // To be able to send money, this function should be marked as payable
        require(msg.value == listing.price, "NFTMarket: Incorrect price");
        // Step 4. Transer the token ownership to the buyer
        ERC721(address(this)).transferFrom(address(this), msg.sender, tokenID);
        // Step 5. Charge the fee for market
        uint256 feeAmount = (listing.price.mul(5).div(100));
        payable(address(this)).transfer(feeAmount);
        // Step 6. Send the money back to the seller
        listing.seller.transfer(listing.price.sub(feeAmount));
        // Step 7. Clear this token in NFT Listing
        clearListing(tokenID);
        // Step 8. Emit event nft transfer
        emit NFTTransfer(tokenID, address(this), msg.sender, "", 0);
    }

    // Cancel listing
    function cancelListing(uint256 tokenID) public {
        // Step 1. Get the listing NFT
        NFTListing memory listing = _listings[tokenID];
        // Step 2. Check the price of listing NFT is negative or not -> If the price is not > 0, it means that NFT is not listing yet or having invalid price
        require(listing.price > 0, "NFTMarket: NFT not listed for sale");
        // Step 3. Check the listing seller is equal to address of sender
        require(
            listing.seller == msg.sender,
            "NFTMarket: You're not the seller"
        );
        // Step 4. Transer the token ownership to the seller (who created NFT)
        ERC721(address(this)).transferFrom(address(this), msg.sender, tokenID);
        // Step 5. Clear the this NFT in listings
        clearListing(tokenID);
        // Step 6. Emit event nft transfer
        emit NFTTransfer(tokenID, address(this), msg.sender, "", 0);
    }

    // Clear listing
    function clearListing(uint256 tokenID) private {
        _listings[tokenID].price = 0;
        _listings[tokenID].seller = payable(address(0));
    }

    // Withdraw fund -> only one address to be able to call (not everyone)
    // who deploy the contract is the owner (initialize first transation to deploy)
    function withdrawFunds() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "NFTMarket: Balance is zero");
        payable(msg.sender).transfer(balance);
    }
}
