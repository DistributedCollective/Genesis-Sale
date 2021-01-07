//SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";
import "./SovrynNft.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract NFTMockSetup is Ownable{
    string[3] name = ["NFT0", "NFT1", "NFT2"];
    string[3] symbol = ["N0", "N1", "N2"];
    address[3] public NFAdress;
    address[5] public holders;
    address admin;

    constructor(address[5] memory _holders) public {
        holders = _holders;
        admin = msg.sender;
    }

   /* This Function is costly during deployment
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
    }*/
    
    function buildNFT(uint256 i) public {
        require(msg.sender == admin, "Only Admin can build NFT");
        NFAdress[i] = address(new SovrynNft(name[i], symbol[i]));
    }

    function mintMockNFT() public {
        require(msg.sender == admin, "Only Admin can build NFT");
        SovrynNft(NFAdress[0]).mint(holders[0]);
        SovrynNft(NFAdress[0]).mint(holders[1]);
        SovrynNft(NFAdress[0]).mint(holders[2]);

        SovrynNft(NFAdress[1]).mint(holders[2]);
        SovrynNft(NFAdress[1]).mint(holders[3]);

        SovrynNft(NFAdress[2]).mint(holders[4]);
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
        return (
            NFAdress[0],
            NFAdress[1],
            NFAdress[2]
        );
    }
}
