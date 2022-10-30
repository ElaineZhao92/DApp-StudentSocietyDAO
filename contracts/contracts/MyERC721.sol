// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

contract MyERC721 is ERC721, IERC721Enumerable {
    address public manager;
    uint256 total_supply;

    mapping(uint256 => uint256) mapNFT;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        manager = msg.sender;
        total_supply = 0;
    }

    // function _baseURI() override internal pure returns (string memory) {
    //     return "http://127.0.0.1:3000/";
    // }

    modifier onlyManager {
        require(msg.sender == manager);
        _;
    }
    function mint(address to, uint256 tokenId) public onlyManager {
        // 这里不需要判断to这个地址是否被分发过NFT，因为ERC721合约里有详细的判断定义
        _mint(to, tokenId);
        mapNFT[total_supply] = tokenId;
        total_supply++;
    }

    function totalSupply() external  view override returns (uint256) {
        return total_supply;
    }

    function tokenByIndex(uint256 index) external view override returns (uint256) {
        return mapNFT[index];
    }
    function tokenOfOwnerByIndex(address owner, uint256 index) public view override returns (uint256) {
        // 这里没有用到，后续可以开发
        return 0;
    }

}