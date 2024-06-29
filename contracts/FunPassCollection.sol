// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract FunPassCollection is ERC721URIStorage, Ownable(msg.sender) {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint256 public constant standardPrice = 0.0001 ether;
    string public constant standardMetadata = "https://maroon-annoyed-dinosaur-120.mypinata.cloud/ipfs/QmRwTiEF3XbYUX9wjQAMbnfFPDaLQicpKBtiBYxEKPSuTW";
    mapping(uint256 => uint256) public tokenPrices;
    mapping(uint256 => bool) public listedMap;

    event TokenListed(uint256 indexed tokenId, uint256 price);
    event TokenDelisted(uint256 indexed tokenId);
    event TokenSold(
        uint256 indexed tokenId,
        uint256 price,
        address from,
        address to
    );

    constructor() ERC721("FunPassCollection", "FUNPASS") {}

    function mintFunPass() public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(address(this), newItemId);  
        _setTokenURI(newItemId, standardMetadata);
        tokenPrices[newItemId] = standardPrice;
        listedMap[newItemId] = true;
        return newItemId;
    }

    function getTokensForSale() public view returns (uint256[] memory) {
    uint256 totalTokens = _tokenIds.current();
    uint256[] memory tokensForSale = new uint256[](totalTokens);
    uint256 saleIndex = 0;

    for (uint256 i = 1; i <= totalTokens; i++) {
        if (listedMap[i]) {
            tokensForSale[saleIndex] = i;
            saleIndex++;
        }
    }

    uint256[] memory fittedArray = new uint256[](saleIndex);
    for (uint256 j = 0; j < saleIndex; j++) {
        fittedArray[j] = tokensForSale[j];
    }

    return fittedArray;
}


    function listFunPass(uint256 tokenId, uint256 price) public {
        require(
            listedMap[tokenId] == false,
            "Token is already on Sale!"
        );
        require(
            ownerOf(tokenId) == msg.sender,
            "Only token owner can list the token"
        );
        require(price > 0, "Price must be greater than zero");
        tokenPrices[tokenId] = price;
        listedMap[tokenId] = true;
        emit TokenListed(tokenId, price);
    }

    function delistFunPass(uint256 tokenId) public {
        require(
            listedMap[tokenId] == true,
            "Token is already delisted!"
        );
        require(
            ownerOf(tokenId) == msg.sender,
            "Only token owner can delist the token"
        );
        listedMap[tokenId] = false;
        emit TokenDelisted(tokenId);
    }

    function buyFunPass(uint256 tokenId) public payable {
        require(listedMap[tokenId], "Token must be listed for sale");
        require(
            msg.value == tokenPrices[tokenId],
            "Please submit the asking price in order to complete the purchase"
        );

        address tokenSeller = ownerOf(tokenId);
        _transfer(tokenSeller, msg.sender, tokenId);
        payable(tokenSeller).transfer(msg.value);
        listedMap[tokenId] = false;
        emit TokenSold(tokenId, tokenPrices[tokenId], tokenSeller, msg.sender);
    }

    function withdrawAll() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable { }
}
11:43