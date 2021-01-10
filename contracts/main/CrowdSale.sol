//SPDX-License-Identifier: MIT
pragma solidity 0.6.2;


import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC721/IERC721.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/IERC721.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/math/SafeMath.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

import "./CSOVToken.sol";


contract CrowdSale is Ownable {
    using SafeMath for uint256;

    /**
     * Event for token purchase logging
     * @param purchaser who paid for the tokens
     * @param value weis paid for purchase
     * @param amount amount of tokens purchased
     */
    event TokenPurchase(
        address indexed purchaser,
        uint256 value,
        uint256 amount
    );
    event Imburse(address payable indexed imbursePurchaser, uint256 amount);
    event CrowdSaleStarted(uint256 total, uint256 sale, uint256 minp);
    address[] NFTAddresses;
    mapping(address => uint256) MaxDepositPerNFT;
    mapping(address => uint256) public InvestorTotalDeposits; // the sum of all deposits per investor
    address public token;
    address payable public sovrynAddress;
    uint256 public end;
    // How many token units a buyer gets per wei
    uint256 public rate;
    // Amount of wei raised
    uint256 public weiRaised = 0;
    uint256 public crowdSaleSupply;
    uint256 public availableTokens;
    uint256 public tokenTotalSupply;
    uint256 public minPurchase;
    bool public saleEnded;
    uint256 public reimburseRBTC = 0;
    bool public isStopSale = false;
    
    /** the admin wallet is allowed to assign tokens to BTC investors*/
    address public admin;
    
    modifier onlyAdmin(){
        require(msg.sender == admin, "unauthorized");
        _;
    }

    /**
     ** maxDepositList[] - array of maxDeposit of RBTC (in wei) per NFT. maxDepositList[i] > maxDepositList[i+1]
     ** NFTAddresses [] - array of NFT's deployed contracts addresses
     **/
    constructor(
        address CSOVAddress,
        address[] memory _NFTAddresses,
        uint256[] memory maxDepositList,
        address payable _sovrynAddress,
        address payable adminAddress
    ) public payable {
        NFTAddresses = _NFTAddresses;
        saleEnded = false;
        token = CSOVAddress;
        sovrynAddress = _sovrynAddress;
        tokenTotalSupply = CSOVToken(token).totalSupply();
        for (uint256 i = 0; i < NFTAddresses.length; i++) {
            MaxDepositPerNFT[NFTAddresses[i]] = maxDepositList[i];
        }
        admin = adminAddress;
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
        require(0 < _minPurchase, "_minPurchase should be > 0");
        require(
            _minPurchase < crowdSaleSupply,
            "_minPurchase should be < crowdSaleSupply"
        );
        require(
            crowdSaleSupply <= tokenTotalSupply,
            "crowdSaleSupply should be <= totalSupply"
        );
        require(duration > 0, "duration should be > 0");
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
        uint256 maxPurchase = getMaxPurchase(msg.sender); // The max purchase allowed based on NFT Holding
        require(maxPurchase > 0, "The User does NOT hold NFT");
        uint256 localminPurchase = 0;
        if(InvestorTotalDeposits[msg.sender] == 0) {
            localminPurchase = maxPurchase.div(2);
            require(msg.value >= localminPurchase,"User must send more than maxPurchase/2");
        }
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

        uint256 RBTCDepositRequest = (msg.value).sub(reimburseRBTC);
        _processPurchase(msg.sender, RBTCDepositRequest, tokenQuantityRequest);
        if (reimburseRBTC > 0) {
            msg.sender.transfer(reimburseRBTC);
            emit Imburse(msg.sender, reimburseRBTC);
        }
    }
    
    /**
     * @notice assigns token to a BTC investor
     * @dev only callable by the admin
     * @param investor the address of the BTC investor
     * @param amountWei the amount of BTC transfered with 18 decimals
     * */
    function assignTokens(address investor, uint amountWei) external onlyAdmin saleActive{
        //no partial investments for btc investors to keep our accounting simple
        uint maxPurchase = getMaxPurchase(investor);
        require(maxPurchase.add(InvestorTotalDeposits[investor]) >= amountWei, "investor already has too many tokens");
        uint numTokens = getTokenAmount(amountWei);
        require(numTokens < availableTokens, "amount needs to be smaller than the number of available tokens");
        _processPurchase(investor, amountWei, numTokens);
    }
    
    /**
     * @dev updates the state and transfers the tokens
     * @param investor the address of the investor
     * @param amountWei the investment amount in wei
     * @param numTokens the number of tokens
     * */
    function _processPurchase(address investor, uint amountWei, uint numTokens) internal{
        availableTokens = availableTokens.sub(numTokens);
        weiRaised = weiRaised.add(amountWei);
        InvestorTotalDeposits[investor] = InvestorTotalDeposits[investor]
            .add(amountWei);
        CSOVToken tokenInstance = CSOVToken(token);
        tokenInstance.transfer(investor, numTokens);
        emit TokenPurchase(investor, rate, amountWei);
    }

    /**
     * @dev   Add to whiteList and resolve max deposit of investor
     * @param investor address
     */
    function getMaxPurchase(address investor)
        public
        view
        returns (uint256 maxpurchase)
    {
        maxpurchase = 0;
        for (uint256 i = 0; i < NFTAddresses.length; i = i.add(1)) {
            if (IERC721(NFTAddresses[i]).balanceOf(investor) > 0) {
                maxpurchase = MaxDepositPerNFT[NFTAddresses[i]];
                break;
            }
        }
        //require moved to buy function, to expose getMaxPurchase to public FE.
        //require(maxpurchase > 0, "The User does NOT hold NFT");
        return (maxpurchase);
    }

    /**
     * @dev  calculate token amount
     * @param _weiAmount - The wei deposit value
     */
    function getTokenAmount(uint256 _weiAmount)
        internal
        view
        returns (uint256)
    {
        return _weiAmount.mul(rate);
    }

    function saleClosure(bool isSaleEnded) external onlyOwner() saleDone() {
        CSOVToken tokenInstance = CSOVToken(token);
        tokenInstance.saleClosure(isSaleEnded);
        saleEnded = true;
    }

    /**
     * @dev   Withdraw all Non sold tokens
     *
     */
    function withdrawTokens() external onlyOwner() saleDone() {
        uint256 tokensSovryn =
            tokenTotalSupply.sub(crowdSaleSupply).add(availableTokens);
        CSOVToken tokenInstance = CSOVToken(token);
        tokenInstance.transfer(sovrynAddress, tokensSovryn);
    }

    /**
     * @dev   Withdraw /all Funds
     *
     */
    function withdrawFunds() external onlyOwner() saleDone() {
          sovrynAddress.transfer(address(this).balance);
          // sovrynAddress.transfer(weiRaised);}
    }

    function balanceOf(address owner) external view returns (uint256) {
        CSOVToken tokenInstance = CSOVToken(token);
        return tokenInstance.balanceOf(owner);
    }

    function stopSell(bool _isStopSale) external onlyOwner() {
        isStopSale = _isStopSale;
    }
    
    modifier saleActive() {
        require(
            !isStopSale && (end > 0 && block.timestamp < end && availableTokens > 0),
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
            isStopSale || (end > 0 && (block.timestamp >= end || availableTokens == 0)),
            "Sale has NOT ended"
        );
        _;
    }
}
