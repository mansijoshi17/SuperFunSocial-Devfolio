// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SFSGameAssets is ERC721URIStorage, Ownable(msg.sender) {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    uint256 public constant PRICE_GRENADE = 0.000011 ether;
    uint256 public constant PRICE_RAILGUN = 0.000022 ether;
    uint256 public constant PRICE_NUKE = 0.000033 ether;

    mapping(string => string) public assetURIs;
    event NewAssetMinted(uint256 indexed tokenId, string assetType);

    constructor() ERC721("GameAssets", "GAME") {
        assetURIs[
            "Grenade"
        ] = "https://maroon-annoyed-dinosaur-120.mypinata.cloud/ipfs/QmZYjBjeaoKjT9VERgDTrLXxN1EUDvE4FSvS6E9vmWU7rn";
        assetURIs[
            "Railgun"
        ] = "https://maroon-annoyed-dinosaur-120.mypinata.cloud/ipfs/QmPWp1SqbdwzionQq82hJqGthXhCE5EdDVBZJjQEU2URgb";
        assetURIs[
            "Nuke"
        ] = "https://maroon-annoyed-dinosaur-120.mypinata.cloud/ipfs/QmXPZ7cE1GJtbFCEPCWRBRw7EgcUCrdvHHU4iaLJrfT47F";
    }

    function mintAsset(string memory assetType) public onlyOwner {
        require(
            bytes(assetURIs[assetType]).length > 0,
            "GameAssets: Invalid asset type"
        );
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _mint(address(this), tokenId);
        _setTokenURI(tokenId, assetURIs[assetType]);
        emit NewAssetMinted(tokenId, assetType);
    }

    function purchaseAsset(uint256 tokenId) public payable {
    address tokenOwner = ownerOf(tokenId); // This will automatically revert if the token does not exist.
    require(tokenOwner != address(0), "GameAssets: Asset does not exist");

    require(
        msg.value >= getPrice(tokenId),
        "GameAssets: Insufficient funds to purchase asset"
    );

    _transfer(tokenOwner, msg.sender, tokenId);
    payable(tokenOwner).transfer(msg.value);
}
 
   function burn(uint256 tokenId) public {
        address owner = ownerOf(tokenId);
        require(
            _msgSender() == owner,
            "GameAssets: caller is not owner nor approved"
        );
        _burn(tokenId);
    }
    function getMyTokens() public view returns (uint256[] memory) {
    uint256 totalTokens = _tokenIdCounter.current();
    uint256[] memory tempTokenIds = new uint256[](totalTokens);
    uint256 index = 0;

    for (uint256 i = 1; i <= totalTokens; i++) {
        address tokenOwner = tryOwnerOf(i);
        if (tokenOwner == msg.sender) {
            tempTokenIds[index] = i;
            index++;
        }
    }

    // Resize the array to remove empty slots
    uint256[] memory ownedTokenIds = new uint256[](index);
    for (uint256 j = 0; j < index; j++) {
        ownedTokenIds[j] = tempTokenIds[j];
    }

    return ownedTokenIds;
}

   function getAllAssets()
    public
    view
    returns (
        uint256[] memory ids,
        string[] memory uris,
        uint256[] memory prices
    )
{
    uint256 totalTokens = _tokenIdCounter.current();
    uint256[] memory tempIds = new uint256[](totalTokens);
    string[] memory tempUris = new string[](totalTokens);
    uint256[] memory tempPrices = new uint256[](totalTokens);
    uint256 index = 0;
    for (uint256 i = 1; i <= totalTokens; i++) {
        address owner = tryOwnerOf(i);
        if (owner == address(this)) {
            tempIds[index] = i;
            tempUris[index] = tokenURI(i);
            tempPrices[index] = getPrice(i);
            index++;
        }
    }

    ids = new uint256[](index);
    uris = new string[](index);
    prices = new uint256[](index);
    for (uint256 j = 0; j < index; j++) {
        ids[j] = tempIds[j];
        uris[j] = tempUris[j];
        prices[j] = tempPrices[j];
    }
}

function tryOwnerOf(uint256 tokenId) public view returns (address) {
    try this.ownerOf(tokenId) returns (address tokenOwner) {
        return tokenOwner;
    } catch {
        return address(0);
    }
}

    function getBalance() public view returns (uint256) {
        return balanceOf(msg.sender);
    }
function getPrice(uint256 tokenId) public view returns (uint256) {
    address owner = tryOwnerOf(tokenId);
    require(owner != address(0), "GameAssets: Query for nonexistent token");

    string memory uri = tokenURI(tokenId);
    if (keccak256(bytes(uri)) == keccak256(bytes(assetURIs["Grenade"]))) {
        return PRICE_GRENADE;
    } else if (keccak256(bytes(uri)) == keccak256(bytes(assetURIs["Railgun"]))) {
        return PRICE_RAILGUN;
    } else if (keccak256(bytes(uri)) == keccak256(bytes(assetURIs["Nuke"]))) {
        return PRICE_NUKE;
    } else {
        revert("GameAssets: Asset type does not exist");
    }
}
    function withdrawAll() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {}
}