//SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";
import "./SovrynNft.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract NFTMockSetup is Ownable {
    string[3] name = ["SovrynNFT0", "SovrynNFT1", "SovrynNFT2"];
    string[3] symbol = ["NF0", "NF1", "NF2"];
    address[3] public NFAdress;
    address[3] public holders;
    address admin;

    constructor(address[3] memory _holders) public {
        holders[0] = _holders[0];
        holders[1] = _holders[1];
        holders[2] = _holders[2];
        admin = msg.sender;
    }

    function buildNFT(uint256 i) public {
        require(msg.sender == admin, "Only Admin can build NFT");
        NFAdress[i] = address(new SovrynNft(name[i], symbol[i]));
    }

    function mintMockNFT() public {
        require(msg.sender == admin, "Only Admin can build NFT");
        SovrynNft(NFAdress[0]).mint(holders[0]);
        SovrynNft(NFAdress[1]).mint(holders[0]);
        SovrynNft(NFAdress[1]).mint(holders[1]);
        SovrynNft(NFAdress[2]).mint(holders[2]);
    }

    function mintNFTHolder(address holder, uint256 rank) public {
        require(msg.sender == admin, "Only Admin can build NFT");
        SovrynNft(NFAdress[rank]).mint(holder);
    }

    function getBalance(address _owner)
        public
        view
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        return (
            SovrynNft(NFAdress[0]).balanceOf(_owner),
            SovrynNft(NFAdress[1]).balanceOf(_owner),
            SovrynNft(NFAdress[2]).balanceOf(_owner)
        );
    }

    function getNFTAddresses()
        public
        view
        returns (
            address,
            address,
            address
        )
    {
        return (NFAdress[0], NFAdress[1], NFAdress[2]);
    }
}
