// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;

//import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
//import "@openzeppelin/contracts/math/SafeMath.sol";
//import "@openzeppelin/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/math/SafeMath.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

import "../main/CSOVToken.sol";

/**
 * @title postCSOV
 * @dev Handle reimburse RBTC or exchange to staking SOV for NON transferable CSOV Tokens
 */
contract PostCSOV is Ownable {
    using SafeMath for uint256;

    /*
     *  Storage
     */
    address private token;
    uint256 public priceSats;
    mapping(address => bool) public processedList;
    uint256 public reImburceAmount;

    /*
     *  Events
     */
    event CSOVReImburse(
        address from,
        uint256 CSOVamount,
        uint256 reImburseAmount
    );

    /**
     * @dev Constructor sets CSOV address and price
     * @param _token CSOV address
     * @param _priceSats sats per CSOV token - presale price is 2500 sats
     */
    constructor(address _token, uint256 _priceSats) public {
        token = _token;
        priceSats = _priceSats;
    }

    /**
     * @dev reImburse - check holder CSOV balance, ReImburse RBTC and store holder address in processedList
     * @param holder address of CSOV holder
     */
    function reImburse(address payable holder) public isNotProcessed(holder) {
        uint256 CSOVAmountWei = CSOVToken(token).balanceOf(holder);
        require(CSOVAmountWei > 0, "holder has no CSOV");
        processedList[holder] = true;

        reImburceAmount = (CSOVAmountWei.mul(priceSats)).div(10**10);
        holder.transfer(reImburceAmount);

        emit CSOVReImburse(holder, CSOVAmountWei, reImburceAmount);
    }

    function budget() external view returns (uint256) {
        uint256 SCBudget = address(this).balance;
        return SCBudget;
    }

    function deposit() public payable {}

    function withdrawAll(address payable to) public onlyOwner {
        to.transfer(address(this).balance);
    }

    modifier isNotProcessed(address holder) {
        require(!processedList[holder], "Address cannot be processed twice");
        _;
    }
}
