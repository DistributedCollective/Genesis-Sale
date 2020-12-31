//SPDX-License-Identifier: MIT
pragma solidity ^0.7.5;

//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract SovrynNft is ERC721, Ownable {
	
	uint256 nonce;
    constructor(
        string memory name,
        string memory symbol)
        ERC721(name, symbol)
        public {}
        
        
    function mint(address receiver) public onlyOwner {
         nonce++;
        _safeMint(receiver, nonce);
    }
    
    function setTokenURI(uint256 tokenId, string memory tokenURI) public onlyOwner {
        _setTokenURI(tokenId, tokenURI);
    }
    
}

