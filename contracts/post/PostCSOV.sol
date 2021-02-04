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
    address[] public tokens;
    uint256 public priceSats;
    mapping(address => bool) public processedList;
    uint256 public reImburseAmount;

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
     * @param _tokens CSOV addresses
     * @param _priceSats sats per CSOV token - presale price is 2500 sats
     */
    constructor(address[] memory _tokens, uint256 _priceSats) public {
        tokens = _tokens;
        priceSats = _priceSats;
    }

    /**
     * @dev reImburse - check holder CSOV balance, ReImburse RBTC and store holder address in processedList
     * @param holder address of CSOV holder
     */
    function reImburse(address payable holder) public isNotProcessed(holder) {
        uint256 CSOVAmountWei = 0;
        for (uint256 i = 0; i < tokens.length; i++) {
            address CSOV = tokens[i];
            uint256 balance = CSOVToken(CSOV).balanceOf(holder);
            CSOVAmountWei = CSOVAmountWei.add(balance);
        }

        require(CSOVAmountWei > 0, "holder has no CSOV");
        processedList[holder] = true;

        reImburseAmount = (CSOVAmountWei.mul(priceSats)).div(10**10);
        require(
            address(this).balance >= reImburseAmount,
            "Not enough funds to reimburse"
        );
        holder.transfer(reImburseAmount);

        emit CSOVReImburse(holder, CSOVAmountWei, reImburseAmount);
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
