//SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "../openzeppelin/Ownable.sol";
import "../mock/NFTHolders.sol";

/**
 * @title WhiteListRegistry based on SovrynNFT holders
 * @dev Whitelist registry based on NFT holders on the SovrynNFT contract.
 * @dev Users with balance > 0 are eligible to participate in the Token crowdsale.
 * @dev Only Owner can add and remove whitelist-addresses.
 */

contract WhiteListReg is Ownable, NFTHolders {
  
    mapping(address => bool) internal _whitelist;
    mapping(address => bool) internal _blacklist;
    event AddedToWhiteList(address contributor);
    event RemovedFromWhiteList(address _contributor);
    
    constructor (address[] memory holders, uint[] memory balance) NFTHolders(holders, balance)  {}
    
    function _addToWhiteList (
        address payable _contributor)
        public {
        require(_contributor != address(0));
        require(
            balanceOf(_contributor) > 0,
            "only NFT Holders can participate in the crowdsale"
        );
        require(_blacklist[_contributor] = true, "User that was removed from the whitelist cannot be re-added");
        _whitelist[_contributor] = true;
        emit AddedToWhiteList(_contributor);
    }

    function _removeFromWhiteList(address _contributor) public onlyOwner {
        require(_contributor != address(0));
        delete _whitelist[_contributor];
        _blacklist[_contributor] = true;
        emit RemovedFromWhiteList(_contributor);
    }

    function isWhiteListed(address _contributor) public view returns (bool) {
        return _whitelist[_contributor];
    }

}