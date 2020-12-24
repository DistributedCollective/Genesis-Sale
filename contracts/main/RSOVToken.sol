//SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import "../openzeppelin/SafeMath.sol";

//import "./SafeMath.sol";

interface ERC20Interface {
    function transfer(address to, uint256 tokens)
        external
        returns (bool success);

    function transferFrom(
        address from,
        address to,
        uint256 tokens
    ) external returns (bool success);

    function balanceOf(address tokenOwner)
        external
        view
        returns (uint256 balance);

    function approve(address spender, uint256 tokens)
        external
        returns (bool success);

    function allowance(address tokenOwner, address spender)
        external
        view
        returns (uint256 remaining);

    function totalSupply() external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 tokens);
    event Approval(
        address indexed tokenOwner,
        address indexed spender,
        uint256 tokens
    );
}

contract RSOVToken is ERC20Interface {
    string public constant NAME = "RSOVrynToken"; // Token Name
    string public constant SYMBOL = "RSOV"; // Token Symbol
    uint8 public constant DECIMALS = 18; // Token decimals
    //uint public constant TOTAL_SUPPLY = 100000000 * (10 ** uint(DECIMALS));
    uint256 public totalSupply_;
    mapping(address => uint256) public balances_;
    mapping(address => mapping(address => uint256)) public allowed;

    constructor(uint256 _totalSupply) {
        totalSupply_ = _totalSupply;
        balances_[msg.sender] = _totalSupply;
    }

    function transfer(address to, uint256 value)
        public
        override
        returns (bool)
    {
        require(balances_[msg.sender] >= value);
        balances_[msg.sender] -= value;
        balances_[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public override returns (bool) {
        uint256 amountAllowance = allowed[from][msg.sender];
        require(balances_[msg.sender] >= value && amountAllowance >= value);
        allowed[from][msg.sender] -= value;
        balances_[msg.sender] -= value;
        balances_[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value)
        public
        override
        returns (bool)
    {
        require(spender != msg.sender);
        allowed[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function allowance(address owner, address spender)
        public
        view
        override
        returns (uint256)
    {
        return allowed[owner][spender];
    }

    function balanceOf(address owner) public view override returns (uint256) {
        return balances_[owner];
    }

    function totalSupply() external view override returns (uint256) {
        return totalSupply_;
    }
}
