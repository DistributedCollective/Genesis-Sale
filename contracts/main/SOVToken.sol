//SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import "../openzeppelin/SafeMath.sol";
import "./WhiteListReg.sol";


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

contract SOVToken is ERC20Interface{
    string public constant NAME = "SovrynToken"; // Token Name 
    string public constant SYMBOL = "SOV"; // Token Symbol
    uint8 public constant DECIMALS = 18; // Token decimals
    address payable public sovrynAddress;
    uint public constant TOTAL_SUPPLY = 100000000 * (10 ** uint(DECIMALS));
    //uint public override totalSupply = TOTAL_SUPPLY;
    mapping(address => uint) public balances;
    mapping(address => mapping(address => uint)) public allowed;
    
    constructor(
        address payable _sovrynAddress)
         {
            sovrynAddress = _sovrynAddress;
            balances[msg.sender] = TOTAL_SUPPLY;
        }
        
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
    function releaseAddress() external  view  returns (address payable) {
        return sovrynAddress; 
    }
}

contract CrowdSale is WhiteListReg {
    using SafeMath for uint;

  // The token being sold
  //ERC20 public token;

  // Address where funds are collected
  //address public wallet;

  // How many token units a buyer gets per wei
  //uint public rate;

  // Amount of wei raised
  // uint public weiRaised;

  /**
   * Event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value weis paid for purchase
   * @param amount amount of tokens purchased
   */
  event TokenPurchase(
    address indexed purchaser,
    address indexed beneficiary,
    uint256 value,
    uint256 amount
  );

  
    struct Sale {
        address investor;
        uint quantity;
    }
    Sale[] public sales;
    mapping(address => bool) public investors;
    address public token;
    address public admin;
    uint public end;
    // How many token units a buyer gets per wei
    uint public rate;
    // Amount of wei raised
    uint public weiRaised;
    uint public crowdSaleSupply;
    uint public availableTokens;
    uint public minPurchase;
    uint public maxPurchase;
    bool public released;
    SOVToken tokenInstance = SOVToken(token);
   
    constructor(
        address payable _sovrynAddress,
        uint _crowdSaleSupply,
        address[] memory whiteListMockAddress,
        uint[] memory whiteListMockBalance
        )
        WhiteListReg(whiteListMockAddress, whiteListMockBalance)
        {
        token = address(new SOVToken(
            _sovrynAddress
        ));
        crowdSaleSupply = _crowdSaleSupply;
        availableTokens = _crowdSaleSupply;
        admin = msg.sender;
    }
    
    /**
   * @dev   Owner is starting the crowdsale
   * @param _rate Number of token units a buyer gets per wei
   * 
   * 
   */
   
    function start(
        uint duration,
        uint _rate,
        uint _minPurchase,
        uint _maxPurchase)
        external
        onlyAdmin() 
        saleNotActive() {
        require(duration > 0, 'duration should be > 0');
        uint totalSupply = SOVToken(token).totalSupply();
        require(crowdSaleSupply > 0 && crowdSaleSupply < totalSupply, "crowdSaleSupply should be > 0 and <= totalSupply");
        require(availableTokens > 0 && availableTokens <= crowdSaleSupply, 'availableTokens should be > 0 and <= crowdSaleSupply');
        require(_minPurchase > 0, '_minPurchase should > 0');
        require(_maxPurchase > 0 && _maxPurchase <= crowdSaleSupply, '_maxPurchase should be > 0 and <= crowdSaleSupply');
        end = duration.add(block.timestamp); 
        rate = _rate;
        minPurchase = _minPurchase;
        maxPurchase = _maxPurchase;
    }
    
    ///  Next Step WIP:  Need to connect WhiteListReg module to investors struct
    ///   and remove this.whitelist function  -- Update modifier: onlyInvestors as well
    ///
    function whitelist(address investor)
        external
        onlyAdmin() {
        investors[investor] = true;    
    }
    
    function buy()
        payable
        external
        onlyInvestors()
        saleActive() {
        require(msg.value >= minPurchase && msg.value <= maxPurchase, 'have to send between minPurchase and maxPurchase');
        uint quantity = getTokenAmount(msg.value);
        require(quantity <= availableTokens, 'Not enough tokens left for sale');
        availableTokens = availableTokens.sub(quantity);
        weiRaised = weiRaised.add(msg.value);
        sales.push(Sale(
            msg.sender,
            quantity
        ));
    }
    
    function release()
        external
        onlyAdmin()
        saleEnded()
        tokensNotReleased() {
        //SOVToken tokenInstance = SOVToken(token);
        released = true;
        
        for(uint i = 0; i < sales.length; i++) {
            Sale storage sale = sales[i];
    // Replace with vesting mechanisem 
            tokenInstance.transfer(sale.investor, sale.quantity);
        }
    }
    
    /**
   * @dev   Withdraw all deposits and Tokens not sold.
   * 
   */
    function withdraw()
        external
        onlyAdmin()
        saleEnded()
        tokensReleased() {
    // Withdraw tokens        
        tokenInstance.transfer(tokenInstance.releaseAddress(), availableTokens);
    // Withdraw funds - need to complete.
    
    }
    
    function getTokenAmount(uint _weiAmount)
        internal
        view returns (uint) {
        return _weiAmount.mul(rate);
    }

    modifier saleActive() {
        require(end > 0 && block.timestamp < end && availableTokens > 0, "Sale must be active");
        _;
    }
    
    modifier saleNotActive() {
        require(end == 0, 'Sale should not be active');
        _;
    }
    
    modifier saleEnded() {
        require(end > 0 && (block.timestamp >= end || availableTokens == 0), 'Sale must have ended');
        _;
    }
    
    modifier tokensNotReleased() {
        require(released == false, 'Tokens must NOT have been released');
        _;
    }
    
    modifier tokensReleased() {
        require(released == true, 'Tokens must have been released');
        _;
    }
    
    modifier onlyInvestors() {
        require(investors[msg.sender] == true, 'only investors');
        _;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin, 'only admin');
        _;
    }
    
}