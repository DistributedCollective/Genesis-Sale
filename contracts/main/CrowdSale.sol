//SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import "../openzeppelin/SafeMath.sol";
//import "./SafeMath.sol";
import "./WhiteListReg.sol";
import "./RSOVToken.sol";

contract CrowdSale is WhiteListReg {
    using SafeMath for uint256;

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
    event CrowdSaleStarted(uint256 total, uint256 sale, uint256 minp);
    event CrowdSaleparams(
        uint256 total,
        uint256 sale,
        uint256 availble,
        uint256 balInit,
        uint256 balStart
    );

    struct Investor {
        uint256 id;
        address payable investorAddress;
        uint256 maxDeposit;
        uint256 actualDeposit;
        uint256 tokenBalance;
    }

    mapping(address => Investor) investors;
    mapping(address => bool) public investorsValid;
    uint256 nextId = 1;
    address public token;
    address payable public admin;
    address payable public sovrynAddress;
    uint256 public end;
    // How many token units a buyer gets per sat
    uint256 public rate;
    // Amount of sat raised
    uint256 public satRaised = 0;
    uint256 public satBase = 0;
    uint256 public crowdSaleSupply;
    uint256 public availableTokens;
    uint256 public tokenTotalSupply;
    uint256 public minPurchase;
    uint256 public maxPurchase;
    uint256 public balinit;

    /**
     * @dev NFTRank uint256 array & maxDeposit uint256 array are params for resolveMaxDeposit method (WhiteListReg.sol)
     * @dev Specifications:
     * @dev 1. NFTRank.length = maxDeposit.length
     * @dev 2. NFTRank[i] > NFTRank[i+1]
     * @dev 3. NFTbalanceOf(_investor) >= NFTRank[0] => maxPurchase = maxDeposit[0]
     * @dev 4. NFTRank[i] > NFTbalanceOf(_investor) > NFTRank[i+1] => maxPurchase = maxDeposit[i+1]
     */
    constructor(
        uint256[] memory NFTRank,
        uint256[] memory maxDeposit,
        address payable _sovrynAddress,
        uint256 _totalSupply,
        address[] memory whiteListMockAddress,
        uint256[] memory whiteListMockBalance
    )
        payable
        WhiteListReg(
            NFTRank,
            maxDeposit,
            whiteListMockAddress,
            whiteListMockBalance
        )
        //RSOVToken(_totalSupply)
    {
        token = address(new RSOVToken(_totalSupply));
        sovrynAddress = _sovrynAddress;
        tokenTotalSupply = RSOVToken(token).totalSupply();
        //RSOVToken tokenAddr = RSOVToken(token);
        //balinit = RSOVToken(token).balanceOf(msg.sender);
        admin = msg.sender;
    }

    /**
     * @dev   Owner starts the crowdsale
     * @param duration - Duration of the sale
     * @param _rate - Number of token units a buyer gets per wei
     * @param _minPurchase - Minimum deposit required
     * @param _crowdSaleSupply - Max number of tokens for the sale
     */
    function start(
        uint256 duration,
        uint256 _rate,
        uint256 _minPurchase,
        uint256 _crowdSaleSupply
    ) external onlyOwner() saleNotActive() {
        crowdSaleSupply = _crowdSaleSupply;

        emit CrowdSaleparams(
            tokenTotalSupply,
            crowdSaleSupply,
            availableTokens,
            balinit ,
            RSOVToken(token).balanceOf(msg.sender)
        );

        require(tokenTotalSupply > 0, "totalSupply should be  > 0");
        require(crowdSaleSupply > 0, "crowdSaleSupply should be > 0");
        require(
            crowdSaleSupply <= tokenTotalSupply,
            "crowdSaleSupply should be <= totalSupply"
        );
        require(duration > 0, "duration should be > 0");
        require(
            _minPurchase < crowdSaleSupply,
            "_minPurchase should be < crowdSaleSupply"
        );
        availableTokens = crowdSaleSupply;
        end = duration.add(block.timestamp);
        rate = _rate;
        minPurchase = _minPurchase;
        emit CrowdSaleStarted(tokenTotalSupply, crowdSaleSupply, minPurchase);
    
    }

    /**
     * @dev   Deposit Funds and receive tokens
     */
    function buy() external payable saleActive() {
        require(msg.value >= minPurchase, "must send more then minPurchase");
        addToWhiteList(msg.sender);
        require(isWhiteListed(msg.sender) == true, "only investors");
        uint256 quantity = getTokenAmount(msg.value);
        require(quantity <= availableTokens, "Not enough tokens left for sale");
        require(msg.value <= maxPurchase, "must send less then maxPurchase");
        // Investor have multiple deposits
        if (investors[msg.sender].id > 0 && investors[msg.sender].id < nextId) {
            require(
                investors[msg.sender].actualDeposit.add(msg.value) <=
                    maxPurchase,
                "Sum of all deposits sent from msg.sender should be less then maxPurchase"
            );
            investors[msg.sender].actualDeposit = investors[msg.sender]
                .actualDeposit
                .add(msg.value);
            investors[msg.sender].tokenBalance = investors[msg.sender]
                .tokenBalance
                .add(quantity);
        }
        // Investor first deposit
        else {
            investors[msg.sender] = Investor(
                nextId,
                msg.sender,
                maxPurchase,
                msg.value,
                quantity
            );
        }

        nextId = nextId.add(1);
        availableTokens = availableTokens.sub(quantity);
        satRaised = satRaised.add(msg.value);
        RSOVToken tokenInstance = RSOVToken(token);
        emit TokenPurchase(msg.sender, rate, msg.value);
        tokenInstance.transfer(msg.sender, quantity);
    }

    /**
     * @dev   Add to whiteList and resolve max deposit of investor
     * @param investor address
     */
    function addToWhiteList(address payable investor) internal {
        maxPurchase = _addToWhiteList(investor);
        investorsValid[investor] = true;
    }

    /**
     * @dev  calculate token amount
     * @param _satAmount - The sat deposit value
     */
    function getTokenAmount(uint256 _satAmount)
        internal
        view
        returns (uint256)
    {
        return _satAmount.mul(rate);
    }

    /**
     * @dev remove from whitelist (externally) by admin only
     * @dev cannot re-add after an address was removed
     * @param investor address
     */
    function removeFromWhiteList(address investor) external onlyOwner() {
        _removeFromWhiteList(investor);
        investorsValid[investor] = false;
    }

    /**
     * @dev   Withdraw all Non sold tokens
     *
     */
    function withdrawTokens() external onlyOwner() saleEnded() {
        uint256 tokensSovryn =
            tokenTotalSupply.sub(crowdSaleSupply).add(availableTokens);
        RSOVToken tokenInstance = RSOVToken(token);
        tokenInstance.transfer(sovrynAddress, tokensSovryn);
    }

    /**
     * @dev   Withdraw Funds
     *
     */
    function withdrawFunds() external onlyOwner() saleEnded() {
        sovrynAddress.transfer(satRaised);
    }

    function balanceOf(address owner) external view returns (uint256) {
        RSOVToken tokenInstance = RSOVToken(token);
        return tokenInstance.balanceOf(owner);
    }

    //receive() external payable {
    //    satBase = satBase.add(msg.value);
    //    }

    modifier saleActive() {
        require(
            end > 0 && block.timestamp < end && availableTokens > 0,
            "Sale must be active"
        );
        _;
    }

    modifier saleNotActive() {
        require(end == 0, "Sale should not be active");
        _;
    }

    modifier saleEnded() {
        require(
            end > 0 && (block.timestamp >= end || availableTokens == 0),
            "Sale must have ended"
        );
        _;
    }

    modifier onlyInvestors() {
        require(isWhiteListed(msg.sender) == true, "only investors");
        _;
    }
}
