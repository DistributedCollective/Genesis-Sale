//SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import "../openzeppelin/SafeMath.sol";
//import "./SafeMath.sol";
import "./WhiteListReg.sol";
import "./XSOVToken.sol";

contract CrowdSale is WhiteListReg {
    using SafeMath for uint;

 // address WRBTCAddress = "0xdsfdsfdsfdsfds";
 
  /**
   * Event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param value weis paid for purchase
   * @param amount amount of tokens purchased
   */
  event TokenPurchase(
    address payable indexed purchaser,
    uint256 value,
    uint256 amount
  );

  
    struct Sale {
        address payable investor;
        uint quantity;
    }
    Sale[] public sales;
    mapping(address => bool) public investors;
    address public token;
    address payable public admin;
    address payable public sovrynAddress;
    uint public end;
    // How many token units a buyer gets per sat
    uint public rate;
    // Amount of sat raised
    uint public satRaised = 0;
    uint public satBase = 0; 
    uint public crowdSaleSupply;
    uint public availableTokens;
    uint public minPurchase;
    uint public maxPurchase;
    bool public released;

    constructor (
        address payable _sovrynAddress,
        uint _crowdSaleSupply,
        address[] memory whiteListMockAddress,
        uint[] memory whiteListMockBalance
        )
         payable
        WhiteListReg(whiteListMockAddress, whiteListMockBalance)
        {
        token = address(new XSOVToken());
        sovrynAddress = _sovrynAddress;
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
        uint totalSupply = XSOVToken(token).totalSupply();
        require(crowdSaleSupply > 0 && crowdSaleSupply <= totalSupply, "crowdSaleSupply should be > 0 and <= totalSupply");
        require(availableTokens > 0 && availableTokens <= crowdSaleSupply, 'availableTokens should be > 0 and <= crowdSaleSupply');
        require(_minPurchase > 0, '_minPurchase should > 0');
        require(_maxPurchase > 0 && _maxPurchase <= crowdSaleSupply, '_maxPurchase should be > 0 and <= crowdSaleSupply');
        end = duration.add(block.timestamp); 
        rate = _rate;
        minPurchase = _minPurchase;
        maxPurchase = _maxPurchase;
    }
    
    receive() external payable {
        satBase=satBase.add(msg.value);}

    function addToWhiteList(address payable investor)
        internal
        {
        _addToWhiteList(investor);
        investors[investor] = true;    
    }
    
    function removeFromWhiteList(address payable investor)
        external
        onlyAdmin() {
        _removeFromWhiteList(investor);
        investors[investor] = false;    
    }
    
    function buy()
        payable
        external
        saleActive() {
        require(msg.value >= minPurchase && msg.value <= maxPurchase, 'have to send between minPurchase and maxPurchase');
        addToWhiteList(msg.sender);
        require(isWhiteListed(msg.sender) == true, 'only investors');
        uint quantity = getTokenAmount(msg.value);
        require(quantity <= availableTokens, 'Not enough tokens left for sale');
        availableTokens = availableTokens.sub(quantity);
        satRaised = satRaised.add(msg.value);
        sales.push(Sale(
            msg.sender,
            quantity
        ));
        emit TokenPurchase(msg.sender, rate, msg.value); 
   
    }
    
    function release()
        external
        onlyAdmin()
        saleEnded()
        tokensNotReleased() {
        XSOVToken tokenInstance = XSOVToken(token);
        released = true;
        for(uint i = 0; i < sales.length; i++) {
            Sale storage sale = sales[i];
            tokenInstance.transfer(sale.investor, sale.quantity);
        }
    }
    
    /**
   * @dev   Withdraw all Non sold tokens
   * 
   */
    function withdrawTokens()
        external
        onlyAdmin()
        saleEnded()
        tokensReleased() {
    // Withdraw XSOV tokens        
        XSOVToken tokenInstance = XSOVToken(token);
        tokenInstance.transfer(sovrynAddress, availableTokens);
    }
    /**
   * @dev   Withdraw all Funds
   * 
   */
    function withdrawFunds()
        external
        onlyAdmin()
        saleEnded()
        tokensReleased() {
    // Withdraw sat funds - need to complete.
    //   WRBTCAddress.transfer(sovrynAddress, satRaised);
    }
    
    function getTokenAmount(uint _satAmount)
        internal
        view returns (uint) {
        return _satAmount.mul(rate);
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
        require(isWhiteListed(msg.sender) == true, 'only investors');
        _;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin, 'only admin');
        _;
    }
    
}