// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "../openzeppelin/SafeMath.sol";
import "../openzeppelin/Ownable.sol";
import "../mock/NFTHolders.sol";

//import "./SafeMath.sol";
//import "./Ownable.sol";
//import "./NFTHolders.sol";

/**
 * @title WhiteListRegistry based on SovrynNFT holders
 * @dev Whitelist registry based on NFT holders on the SovrynNFT contract.
 * @dev Users with balance > 0 are eligible to participate in the Token crowdsale.
 * @dev Only Owner can add and remove whitelist-addresses.
 */

contract WhiteListReg is Ownable, NFTHolders {
    using SafeMath for uint256;

    uint256[] NFTRank;
    uint256[] maxDeposit;
    mapping(address => bool) internal _whitelist;
    mapping(address => bool) internal _blacklist;
    event AddedToWhiteList(address investor);
    event RemovedFromWhiteList(address _investor);

    constructor(
        uint256[] memory _NFTRank,
        uint256[] memory _maxDeposit,
        address[] memory holders,
        uint256[] memory balance
    ) NFTHolders(holders, balance) {
        NFTRank = _NFTRank;
        maxDeposit = _maxDeposit;
    }

    function _addToWhiteList(address payable _investor)
        internal
        returns (uint256)
    {
        require(_investor != address(0));
        require(
            NFTbalanceOf(_investor) > 0,
            "only NFT Holders can participate in the crowdsale"
        );
        uint256 _maxPurchase;
        require(
            !_blacklist[_investor],
            "Investor that was removed from the whitelist cannot be re-added"
        );
        _maxPurchase = resolveMaxDeposit(_investor);
        _whitelist[_investor] = true;
        emit AddedToWhiteList(_investor);
        return (_maxPurchase);
    }

    /**
     * @dev resolve Max deposit of investor
     * @param _investor address of investor
     */
    function resolveMaxDeposit(address payable _investor)
        public
        view
        returns (uint256 _maxPurchase)
    {
        uint256 bal = NFTbalanceOf(_investor);
        uint256 i = 0;
        if (bal >= NFTRank[0]) {
            _maxPurchase = maxDeposit[0];
            return (_maxPurchase);
        } else {
            while (bal < NFTRank[i]) {
                require(
                    maxDeposit[i.add(1)] > 0,
                    "Investor NFT balance does NOT fit with NFTRank-MaxDeposit Inputs"
                );
                i = i.add(1);
            }
            _maxPurchase = maxDeposit[i];
            return (_maxPurchase);
        }
    }

    function _removeFromWhiteList(address _investor) internal onlyOwner {
        require(_investor != address(0));
        delete _whitelist[_investor];
        _blacklist[_investor] = true;
        emit RemovedFromWhiteList(_investor);
    }

    function isWhiteListed(address _investor) public view returns (bool) {
        return _whitelist[_investor];
    }
}
