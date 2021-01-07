//SPDX-License-Identifier: MIT
pragma solidity 0.6.2;

import "openzeppelin-solidity/contracts/GSN/Context.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/GSN/Context.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/math/SafeMath.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";


contract CSOVToken is ERC20, Ownable {
    using SafeMath for uint256;

    string private constant NAME = "CSOVrynToken"; // Token Name
    string private constant SYMBOL = "CSOV"; // Token Symbol
    uint8 private constant DECIMALS = 18; // Token decimals

    bool public isSaleEnded;
    address payable saleAdmin;
    
    /**
     * @dev Sets the values for {name} and {symbol}, initializes {decimals} with
     * a default value of 18.
     *
     * To select a different value for {decimals}, use {_setupDecimals}.
     *
     * All three of these values are immutable: they can only be set once during
     * construction.
     */
    constructor(uint256 totalSupply_) ERC20(NAME, SYMBOL) public {
        _mint(msg.sender, totalSupply_);
        isSaleEnded = false;
        saleAdmin = msg.sender;
    }

    function saleClosure(bool _isSaleEnded) public {
        require(msg.sender == saleAdmin, "Only saleAdmin can close the sale");
        if (!isSaleEnded) {
            isSaleEnded = _isSaleEnded;
        }
    }

    function setSaleAdmin(address payable _saleAdmin) public onlyOwner() {
        saleAdmin = _saleAdmin;
        transfer(_saleAdmin, super.balanceOf(msg.sender));
    }

    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `recipient` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     */
    function transfer(address to, uint256 value)
        public
        override
        returns (bool)
    {
        require(
            isSaleEnded || (msg.sender == owner()) || msg.sender == saleAdmin,
            "Token Transfer is not allowed during the sale"
        );
        return super.transfer(to, value);
    }

}
