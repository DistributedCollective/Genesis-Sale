//SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import "../openzeppelin/SafeMath.sol";
import "../openzeppelin/Ownable.sol";
import "../openzeppelin/ERC20.sol";
//import "./SafeMath.sol";
//import "./Ownable.sol";
//import "./ERC20.sol";

interface tokenRecipient {
    function receiveApproval(
        address _from,
        uint256 _value,
        address _token,
        bytes calldata _extraData
    ) external;
}

contract SOVToken is ERC20, Ownable {
    string public constant NAME = "SovrynToken"; // Token Name
    string public constant SYMBOL = "SOV"; // Token Symbol

    constructor(uint256 totalSupply_) ERC20(NAME, SYMBOL) {
        _mint(msg.sender, totalSupply_);
    }

    /**
     * Set allowance for other address and notify
     *
     * Allows `_spender` to spend no more than `_value` tokens in your behalf, and then ping the contract about it
     *
     * @param _spender The address authorized to spend
     * @param _value the max amount they can spend
     * @param _extraData some extra information to send to the approved contract
     */
    function approveAndCall(
        address _spender,
        uint256 _value,
        bytes memory _extraData
    ) public returns (bool success) {
        tokenRecipient spender = tokenRecipient(_spender);
        if (approve(_spender, _value)) {
            spender.receiveApproval(
                msg.sender,
                _value,
                address(this),
                _extraData
            );
            return true;
        }
    }
}
