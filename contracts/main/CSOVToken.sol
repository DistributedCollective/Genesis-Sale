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

    bool public isSaleEnded;
    address payable saleWalletAdmin;
    address payable saleAdmin;
    address payable csovAdmin;
    bool public isSaleAdminsUpdate;

    /**
     *
     * All three of these values are immutable: they can only be set once during
     * construction.
     */
    constructor(uint256 totalSupply_, address payable _csovAdmin)
        public
        ERC20(NAME, SYMBOL)
    {
        csovAdmin = _csovAdmin;
        isSaleEnded = false;
        transferOwnership(_csovAdmin);
        _mint(_csovAdmin, totalSupply_);
    }

    function saleClosure(bool _isSaleEnded) public {
        require(msg.sender == saleAdmin, "Only saleAdmin can close the sale");
        if (!isSaleEnded) {
            isSaleEnded = _isSaleEnded;
        }
    }

    function setSaleAdmins(
        address payable _saleAdmin,
        address payable _saleWalletAdmin
    ) external onlyOwner {
        saleAdmin = _saleAdmin;
        saleWalletAdmin = _saleWalletAdmin;
        isSaleAdminsUpdate = true;
        require(
            transfer(saleAdmin, balanceOf(csovAdmin)),
            "saleAdmin token transer failed"
        );
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
            isSaleEnded ||
                (msg.sender == owner()) ||
                msg.sender == saleAdmin ||
                msg.sender == saleWalletAdmin,
            "Token Transfer is not allowed during the sale"
        );
        return super.transfer(to, value);
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        require(
            isSaleEnded ||
                sender == owner() ||
                sender == saleAdmin ||
                sender == saleWalletAdmin,
            "Token Transfer is not allowed during the sale"
        );
        return super.transferFrom(sender, recipient, amount);
    }
}
