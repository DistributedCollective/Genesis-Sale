// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "../openzeppelin/SafeMath.sol";
import "../openzeppelin/Ownable.sol";
import "../mock/NFTHolders.sol";
//import "./SafeMath.sol";
//import "./Ownable.sol";
//import "./NFTHolders.sol";

/**
 * @title investorMaxPurchase based on SovrynNFT holders
 */

contract InvestorMaxPurchase is Ownable, NFTHolders {
    using SafeMath for uint256;

    uint256 internal maxPurchase;
    mapping(address => uint256) NFTMaxPurchase;

    constructor(
        uint256[] memory maxDepositList,
        address[] memory holders,
        address[] memory NFTAddresses,
        address[] memory NFT0Holders,
        address[] memory NFT1Holders,
        address[] memory NFT2Holders,
        address[] memory NFT3Holders,
        address[] memory NFT4Holders
    )
        NFTHolders(
            holders,
            NFTAddresses,
            NFT0Holders,
            NFT1Holders,
            NFT2Holders,
            NFT3Holders,
            NFT4Holders
        )
    {
        for (uint256 i = 0; i < NFTAddresses.length; i = i.add(1)) {
            NFTMaxPurchase[NFTAddresses[i]] = maxDepositList[i];
        }
    }

    /**
     * @dev get Investor Max Purchase limit
     * @param _investor address of investor
     * @return maxPurchase of investor
     */
    function getInvestorMaxPurchase(address payable _investor)
        internal
        returns (uint256)
    {
        address NFTAddress;
        require(_investor != address(0x0));
        NFTAddress = HolderNFT(_investor);
        if (NFTAddress == address(0x0)) {
            maxPurchase = 0;
        } else {
            maxPurchase = NFTMaxPurchase[NFTAddress];
        }
        return (maxPurchase);
    }
}
