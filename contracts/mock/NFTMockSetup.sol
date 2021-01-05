//SPDX-License-Identifier: MIT
pragma solidity ^0.7.5;

//import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
//import "openzeppelin-solidity/contracts/access/Ownable.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/";
import "./SovrynNft.sol";

contract NFTMockSetup {
    string[5] name = ["NFT0", "NFT1", "NFT2", "NFT3", "NFT4"];
    string[5] symbol = ["N0", "N1", "N2", "N3", "N4"];
    address[5] public NFAdress;
    address[5] public holders;
    address admin;
    address public temp0;

    constructor(address[5] memory _holders) public {
        holders = _holders;
        admin = msg.sender;
    }

    function buildMockAndMint() public {
        require(msg.sender == admin, "Only Admin can build NFT");
        for (uint256 i = 0; i < 5; i++) {
            NFAdress[i] = address(new SovrynNft(name[i], symbol[i]));
        }
        SovrynNft(NFAdress[0]).mint(holders[0]);
        SovrynNft(NFAdress[0]).mint(holders[1]);
        SovrynNft(NFAdress[0]).mint(holders[2]);

        SovrynNft(NFAdress[1]).mint(holders[2]);
        SovrynNft(NFAdress[1]).mint(holders[3]);

        SovrynNft(NFAdress[2]).mint(holders[0]);

        SovrynNft(NFAdress[3]).mint(holders[2]);
        SovrynNft(NFAdress[3]).mint(holders[3]);
        SovrynNft(NFAdress[3]).mint(holders[1]);

        SovrynNft(NFAdress[4]).mint(holders[2]);
        SovrynNft(NFAdress[4]).mint(holders[4]);
    }

    function buildNFT(uint256 i) public {
        require(msg.sender == admin, "Only Admin can build NFT");
        //for(uint256 i = 0 ; i < 5 ; i++){
        NFAdress[i] = address(new SovrynNft(name[i], symbol[i]));
        //}
    }

    function mintNFT() public {
        require(msg.sender == admin, "Only Admin can build NFT");
        SovrynNft(NFAdress[0]).mint(holders[0]);
        SovrynNft(NFAdress[0]).mint(holders[1]);
        SovrynNft(NFAdress[0]).mint(holders[2]);

        SovrynNft(NFAdress[1]).mint(holders[2]);
        SovrynNft(NFAdress[1]).mint(holders[3]);

        SovrynNft(NFAdress[2]).mint(holders[0]);

        SovrynNft(NFAdress[3]).mint(holders[2]);
        SovrynNft(NFAdress[3]).mint(holders[3]);
        SovrynNft(NFAdress[3]).mint(holders[1]);

        SovrynNft(NFAdress[4]).mint(holders[2]);
        SovrynNft(NFAdress[4]).mint(holders[4]);
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
            uint256,
            uint256,
            uint256
        )
    {
        return (
            SovrynNft(NFAdress[0]).balanceOf(_owner),
            SovrynNft(NFAdress[1]).balanceOf(_owner),
            SovrynNft(NFAdress[2]).balanceOf(_owner),
            SovrynNft(NFAdress[3]).balanceOf(_owner),
            SovrynNft(NFAdress[4]).balanceOf(_owner)
        );
    }

    function getNFTAddresses()
        public
        view
        returns (
            address,
            address,
            address,
            address,
            address
        )
    {
        return (
            NFAdress[0],
            NFAdress[1],
            NFAdress[2],
            NFAdress[3],
            NFAdress[4]
        );
    }
}
