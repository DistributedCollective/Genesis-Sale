//SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import "../openzeppelin/SafeMath.sol";
import "../openzeppelin/Ownable.sol";
import "../openzeppelin/IERC20.sol";

import "openzeppelin-solidity/contracts/token/ERC721/IERC721.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/IERC721.sol";
import "./CSOVToken.sol";

//import "./SafeMath.sol";
//import "./Ownable.sol";
//import "./IERC20.sol";

contract CrowdSale is Ownable {
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
    event Imburse(address payable indexed imbursePurchaser, uint256 amount);
    event CrowdSaleStarted(uint256 total, uint256 sale, uint256 minp);
    address[] NFTAddresses;
    mapping(address => uint256) MaxDepositPerNFT;
    mapping(address => uint256) InvestorTotalDeposits; // the sum of all deposits per investor
    address public token;
    //address payable public admin;
    address payable public sovrynAddress;
    uint256 public end;
    // How many token units a buyer gets per sat
    uint256 public rate;
    // Amount of sat raised
    uint256 public satRaised = 0;
    uint256 public crowdSaleSupply;
    uint256 public availableTokens;
    uint256 public tokenTotalSupply;
    uint256 public minPurchase;
    bool public saleEnded;
    uint256 reimburseRBTC = 0;

    /**
     ** maxDepositList[] - array of maxDeposit of RBTC (in sat) per NFT. maxDepositList[i] > maxDepositList[i+1]
     ** NFTAddresses [] - array of NFT's deployed contracts addresses
     **/
    constructor(
        address CSOVAddress,
        address[] memory _NFTAddresses,
        uint256[] memory maxDepositList,
        address payable _sovrynAddress
    ) payable {
        NFTAddresses = _NFTAddresses;
        saleEnded = false;
        token = CSOVAddress;
        sovrynAddress = _sovrynAddress;
        tokenTotalSupply = CSOVToken(token).totalSupply();
        for (uint256 i = 0; i < NFTAddresses.length; i++) {
            MaxDepositPerNFT[NFTAddresses[i]] = maxDepositList[i];
        }
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
        CSOVToken tokenInstance = CSOVToken(token);
        tokenInstance.transfer(msg.sender, tokenQuantityRequest);
        emit TokenPurchase(msg.sender, rate, RBTCDepositRequest);
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
        require(maxpurchase > 0, "The User does NOT hold NFT");
        return (maxpurchase);
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
        CSOVToken tokenInstance = CSOVToken(token);
        tokenInstance.saleClosure(isSaleEnded);
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
        sovrynAddress.transfer(satRaised);
    }

    function balanceOf(address owner) external view returns (uint256) {
        CSOVToken tokenInstance = CSOVToken(token);
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
            "Sale has NOT ended"
        );
        _;
    }
}
