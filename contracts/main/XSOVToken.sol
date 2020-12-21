//SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import "../openzeppelin/SafeMath.sol";
//import "./SafeMath.sol";

interface ERC20Interface {
    function transfer(address to, uint tokens) external returns (bool success);
    function transferFrom(address from, address to, uint tokens) external returns (bool success);
    function balanceOf(address tokenOwner) external view returns (uint balance);
    function approve(address spender, uint tokens) external returns (bool success);
    function allowance(address tokenOwner, address spender) external view returns (uint remaining);
    function totalSupply() external view returns (uint);

    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}

contract XSOVToken is ERC20Interface{
    string public constant NAME = "XSovrynToken"; // Token Name 
    string public constant SYMBOL = "XSOV"; // Token Symbol
    uint8 public constant DECIMALS = 18; // Token decimals
    uint public constant TOTAL_SUPPLY = 100000000 * (10 ** uint(DECIMALS));
    mapping(address => uint) public balances;
    mapping(address => mapping(address => uint)) public allowed;
    
    constructor()
         { balances[msg.sender] = TOTAL_SUPPLY; }
        
    function transfer(address to, uint value) public override returns(bool) {
        require(balances[msg.sender] >= value);
        balances[msg.sender] -= value;
        balances[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }
    
    function transferFrom(address from, address to, uint value) public override returns(bool) {
        uint amountAllowance = allowed[from][msg.sender];
        require(balances[msg.sender] >= value && amountAllowance >= value);
        allowed[from][msg.sender] -= value;
        balances[msg.sender] -= value;
        balances[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }
    
    function approve(address spender, uint value) public override returns(bool) {
        require(spender != msg.sender);
        allowed[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    function allowance(address owner, address spender) public override view returns(uint) {
        return allowed[owner][spender];
    }
    
    function balanceOf(address owner) public override view returns(uint) {
        return balances[owner];
    }
    function totalSupply() external override pure  returns (uint) {
        return TOTAL_SUPPLY; 
    }
}