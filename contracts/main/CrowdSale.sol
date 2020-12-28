//SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import "../openzeppelin/SafeMath.sol";
//import "./SafeMath.sol";
import "./InvestorMaxPurchase.sol";
import "./RSOVToken.sol";

contract CrowdSale is InvestorMaxPurchase {
    using SafeMath for uint256;

    /*
     * Event for token purchase logging
     * @param purchaser who paid for the tokens
     * @param rate weis paid for purchase
     * @param amountDeposit deposit amount
     * @param amountToken Token received amount
     */
    event TokenPurchase(
        address payable indexed purchaser,
        uint256 rate,
        uint256 amountDeposit,
        uint256 amountToken
    );
    event Imburse(address payable indexed imbursePurchaser, uint256 amount);
    event CrowdSaleStarted(uint256 total, uint256 sale, uint256 minp);
    mapping(address => uint256) InvestorTotalDeposits; // the sum of all deposits per investor
    address public token;
    //address payable public admin;
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
    //uint256 public maxPurchase;
    uint256 public balinit;
    bool public saleEnded;
    uint256 reimburseRBTC = 0;

    /**
     * @dev NFTRank uint256 array & maxDeposit uint256 array are params for resolveMaxDeposit method (WhiteListReg.sol)
     * @dev Specifications:
     * @dev 1. NFTRank.length = maxDeposit.length
     * @dev 2. NFTRank[i] > NFTRank[i+1]
     * @dev 3. NFTbalanceOf(_investor) >= NFTRank[0] => maxPurchase = maxDeposit[0]
     * @dev 4. NFTRank[i] > NFTbalanceOf(_investor) > NFTRank[i+1] => maxPurchase = maxDeposit[i+1]
     * @dev extract HolderTopNFT mapping (holder address => top NFTrank address)
     * @dev all the extraction (high gas) is done in the constructor
     * InvestorMaxPurchase.sol input (uint256):
     ** maxDepositList[] - array of maxDeposit of RBTC (in sat) per NFT rank.
     * NFTHolders.sol Inputs (all addresses):
     ** holders      [] - array of all holders addresses
     ** NFTAddresses [] - array of 5 NFT's addresses
     ** NFT0Holders  [] - all addresses that hold NFT0 (highest NFT Rank)
     ** NFT1Holders  [] - all addresses that hold NFT1
     ** NFT2Holders  [] - all addresses that hold NFT2
     ** NFT3Holders  [] - all addresses that hold NFT3
     ** NFT4Holders  [] - all addresses that hold NFT4 (lowest NFT Rank)
     **/
    constructor(
        uint256[] memory maxDepositList,
        address[] memory holders,
        address[] memory NFTAddresses,
        address[] memory NFT0Holders,
        address[] memory NFT1Holders,
        address[] memory NFT2Holders,
        address[] memory NFT3Holders,
        address[] memory NFT4Holders,
        address payable _sovrynAddress,
        uint256 _totalSupply
    )
        payable
        InvestorMaxPurchase(
            maxDepositList,
            holders,
            NFTAddresses,
            NFT0Holders,
            NFT1Holders,
            NFT2Holders,
            NFT3Holders,
            NFT4Holders
        )
    {
        saleEnded = false;
        token = address(new RSOVToken(_totalSupply, saleEnded));
        sovrynAddress = _sovrynAddress;
        tokenTotalSupply = RSOVToken(token).totalSupply();
        //admin = msg.sender;
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
        maxPurchase = getMaxPurchase(msg.sender); // The max purchase allowed based on NFT Holding
        uint256 depositAllowed =
            maxPurchase.sub(InvestorTotalDeposits[msg.sender]); // The max allowed deposit after sub of former deposits of the same investor
        maxPurchase = 0;
        require(depositAllowed != 0, "Deposit is not allowed");
        uint256 tokenQuantityAllowed = getTokenAmount(depositAllowed); // The max token allowed
        if (tokenQuantityAllowed > availableTokens) {
            tokenQuantityAllowed = availableTokens; //  cannot sell more than availble tokens of the sale
        }
        uint256 tokenQuantityRequest = getTokenAmount(msg.value); // The token amount the investor requests
        if (tokenQuantityRequest > tokenQuantityAllowed) {
            reimburseRBTC = (tokenQuantityRequest.sub(tokenQuantityAllowed))
                .div(rate); //ReimburseRBTC > 0 if tokenRequest> tokenAllowed
            tokenQuantityRequest = tokenQuantityAllowed;
        }

        availableTokens = availableTokens.sub(tokenQuantityRequest);
        uint256 RBTCDepositRequest = (msg.value).sub(reimburseRBTC);
        InvestorTotalDeposits[msg.sender] = InvestorTotalDeposits[msg.sender]
            .add(RBTCDepositRequest);
        satRaised = satRaised.add(RBTCDepositRequest);
        RSOVToken tokenInstance = RSOVToken(token);
        tokenInstance.transfer(msg.sender, tokenQuantityRequest);
        emit TokenPurchase(
            msg.sender,
            rate,
            RBTCDepositRequest,
            tokenQuantityRequest
        );
        if (reimburseRBTC > 0) {
            msg.sender.transfer(reimburseRBTC);
            emit Imburse(msg.sender, reimburseRBTC);
        }
    }

    /**
     * @dev   Add to whiteList and resolve max deposit of investor
     * @param investor address
     */
    function getMaxPurchase(address payable investor)
        internal
        returns (uint256 maxPurchase)
    {
        maxPurchase = getInvestorMaxPurchase(investor);
        return maxPurchase;
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

    function saleClosure(bool isSaleEnded) external onlyOwner() saleDone() {
        RSOVToken tokenInstance = RSOVToken(token);
        tokenInstance.saleClosure(isSaleEnded);
    }

    /**
     * @dev   Withdraw all Non sold tokens
     *
     */
    function withdrawTokens() external onlyOwner() saleDone() {
        uint256 tokensSovryn =
            tokenTotalSupply.sub(crowdSaleSupply).add(availableTokens);
        RSOVToken tokenInstance = RSOVToken(token);
        tokenInstance.transfer(sovrynAddress, tokensSovryn);
    }

    /**
     * @dev   Withdraw /all Funds
     *
     */
    function withdrawFunds() external onlyOwner() saleDone() {
        sovrynAddress.transfer(satRaised);
    }

    function balanceOf(address owner) external view returns (uint256) {
        RSOVToken tokenInstance = RSOVToken(token);
        return tokenInstance.balanceOf(owner);
    }

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

    modifier saleDone() {
        require(
            end > 0 && (block.timestamp >= end || availableTokens == 0),
            "Sale must have ended"
        );
        _;
    }
}
