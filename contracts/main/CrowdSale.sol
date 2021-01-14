//SPDX-License-Identifier: MIT
pragma solidity 0.6.2;

import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC721/IERC721.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contra cts/blob/master/contracts/token/ERC721/IERC721.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/math/SafeMath.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";
import "./CSOVToken.sol";

contract CrowdSale is Ownable {
    using SafeMath for uint256;

    // the sum of all deposits per investor
    mapping(address => uint256) public InvestorTotalDeposits;
    mapping(address => uint256) public MaxDepositPerNFT;
/** Admin wallets allowed to assign tokens to BTC investors*/
    mapping(address => bool) public isAdmin;
    address public token;
    address[] public NFTAddresses;
    address payable public sovrynAddress;
    uint256 public end;
    // How many token units a buyer gets per wei
    uint256 public rate;
    // Amount of wei raised
    uint256 public weiRaised;
    uint256 public crowdSaleSupply;
    uint256 public availableTokens;
    uint256 public tokenTotalSupply;
    uint256 public minPurchase;
    //uint256 public maxPurchase;
    bool public saleEnded;
    bool public isStopSale;

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

    /**
     ** maxDepositList[] - array of maxDeposit of RBTC (in wei) per NFT. maxDepositList[i] > maxDepositList[i+1]
     ** NFTAddresses [] - array of NFT's deployed contracts addresses
     **/
    constructor(
        address _CSOVAddress,
        address[] memory _NFTAddresses,
        uint256[] memory _maxDepositList,
        address payable _sovrynAddress
    ) public payable {
        token = _CSOVAddress;
        NFTAddresses = _NFTAddresses;
        sovrynAddress = _sovrynAddress;
        tokenTotalSupply = CSOVToken(token).totalSupply();

        for (uint256 i = 0; i < NFTAddresses.length; i++) {
            MaxDepositPerNFT[NFTAddresses[i]] = _maxDepositList[i];
            if (i < (NFTAddresses.length - 1)) {
                require(
                    _maxDepositList[i] > _maxDepositList[i + 1],
                    "maxDepositList[] must be in order: maxDepositList[i] > maxDepositList[i+1]"
                );
            }
        }
    }

    /**
     * @dev   Owner starts the crowdsale
     * @param _duration - Duration of the sale
     * @param _rate - Number of token units a buyer gets per wei
     * @param _minPurchase - Minimum deposit required
     * @param _crowdSaleSupply - Max number of tokens for the sale
     */
    function start(
        uint256 _duration,
        uint256 _rate,
        uint256 _minPurchase,
        uint256 _crowdSaleSupply
    ) external onlyOwner saleNotActive {
        CSOVToken tokenInstance = CSOVToken(token);
        require(tokenInstance.isSaleAdminsUpdate(), "Need to call setSaleAdmin on CSOVToken before start");
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
        require(_duration > 0, "_duration should be > 0");
        availableTokens = crowdSaleSupply;
        end = _duration.add(block.timestamp);
        rate = _rate;
        minPurchase = _minPurchase;
        emit CrowdSaleStarted(tokenTotalSupply, crowdSaleSupply, minPurchase);
    }

    /**
     * @dev   Deposit Funds and receive tokens
     * @dev   This function first check the RBTC deposit requirements and then the token availablility
     * @dev   Reimburse in 2 cases:
     * @dev   A.Investor sends more than his maxPurchase amount
     * @dev    (Can-not a must- happen to each investor only once)
     * @dev   B.Not enough available coins left for the sale
     * @dev    (Can happen only once during the sale, since sale will be closed once availbleTokens == 0)
     */
    function buy() external payable saleActive {
        // Check Deposit RBTC deposit for requirements ==> depositAllowed
        require(
            msg.value >= minPurchase,
            "must send more then global minPurchase"
        );

        // maxPurchase is the max purchase allowed based on NFT Holding
        uint256 maxPurchase = getMaxPurchase(msg.sender);
        require(maxPurchase > 0, "The User does NOT hold NFT");

        // depositAllowed is the allowed deposit after sub of former deposits by the same investor
        uint256 depositAllowed =
            maxPurchase.sub(InvestorTotalDeposits[msg.sender]);
        maxPurchase = 0;
        require(
            depositAllowed != 0,
            "Investor deposits have reached maxPurchase amount"
        );
        // Check Token availability
        // cannot sell more than availble tokens left for the sale
        uint256 tokenQuantityAllowed = getTokenAmount(depositAllowed);
        if (tokenQuantityAllowed > availableTokens) {
            tokenQuantityAllowed = availableTokens;
        }

        // The token amount the investor wish to buy
        uint256 tokenQuantityRequest = getTokenAmount(msg.value);

        // ReimburseRBTC > 0 if tokenRequest > tokenAllowed
        uint256 reimburseRBTC;
        if (tokenQuantityRequest > tokenQuantityAllowed) {
            reimburseRBTC = (tokenQuantityRequest.sub(tokenQuantityAllowed))
                .div(rate);
            tokenQuantityRequest = tokenQuantityAllowed;
        }

        uint256 RBTCDepositRequest = (msg.value).sub(reimburseRBTC);
        _processPurchase(msg.sender, RBTCDepositRequest, tokenQuantityRequest);

        // Refund RBTC
        if (reimburseRBTC > 0) {
            msg.sender.transfer(reimburseRBTC);
            emit Imburse(msg.sender, reimburseRBTC);
        }
    }

    /**
     * @notice assigns token to a BTC investor
     * @dev only callable by the admins
     * @param _investor the address of the BTC investor
     * @param _amountWei the amount of BTC transfered with 18 decimals
     * */
    function assignTokens(address _investor, uint256 _amountWei)
        external
        onlyAdmin
        saleActive
    {
        //no partial investments for btc investors to keep our accounting simple
        uint256 maxPurchase = getMaxPurchase(_investor);
        require(
            maxPurchase >= _amountWei.add(InvestorTotalDeposits[_investor]),
            "investor already has too many tokens"
        );
        uint256 numTokens = getTokenAmount(_amountWei);
        require(
            numTokens <= availableTokens,
            "amount needs to be smaller than the number of available tokens"
        );
        _processPurchase(_investor, _amountWei, numTokens);
    }

    /**
     * @dev updates the state and transfers the tokens
     * @param _investor the address of the investor
     * @param _amountWei the investment amount in wei
     * @param _numTokens the number of tokens
     * */
    function _processPurchase(
        address _investor,
        uint256 _amountWei,
        uint256 _numTokens
    ) internal {
        availableTokens = availableTokens.sub(_numTokens);
        weiRaised = weiRaised.add(_amountWei);
        InvestorTotalDeposits[_investor] = InvestorTotalDeposits[_investor].add(
            _amountWei
        );
        CSOVToken tokenInstance = CSOVToken(token);
        tokenInstance.transfer(_investor, _numTokens);
        emit TokenPurchase(_investor, _amountWei, _numTokens);
    }

    /**
     * @dev   Add to whiteList and resolve max deposit of _investor
     * @param _investor address
     */
    function getMaxPurchase(address _investor) public view returns (uint256) {
        uint256 maxpurchase = 0;
        for (uint256 i = 0; i < NFTAddresses.length; i++) {
            if (IERC721(NFTAddresses[i]).balanceOf(_investor) > 0) {
                maxpurchase = MaxDepositPerNFT[NFTAddresses[i]];
                break;
            }
        }
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

    function saleClosure(bool _isSaleEnded) external onlyOwner() saleDone() {
        CSOVToken tokenInstance = CSOVToken(token);
        tokenInstance.saleClosure(_isSaleEnded);
        saleEnded = _isSaleEnded;
    }

    /**
     * @dev   Withdraw all Non sold tokens
     *
     */
    function withdrawTokens() external onlyOwner() saleDone() {
        uint256 tokensSovryn =
            tokenTotalSupply.sub(crowdSaleSupply).add(availableTokens);
        CSOVToken tokenInstance = CSOVToken(token);
        //tokenInstance.transfer(sovrynAddress, tokensSovryn);
        require(
            tokenInstance.transfer(sovrynAddress, tokensSovryn),
            "transfer failed"
        );
    }

    /**
     * @dev   Withdraw /all Funds
     *
     */
    function withdrawFunds() external onlyOwner saleDone {
        sovrynAddress.transfer(address(this).balance);
        // sovrynAddress.transfer(weiRaised);}
    }

    function balanceOf(address _owner) external view returns (uint256) {
        CSOVToken tokenInstance = CSOVToken(token);
        return tokenInstance.balanceOf(_owner);
    }

    function stopSale(bool _isStopSale) external onlyAdmin {
        isStopSale = _isStopSale;
    }

    function renounceOwnership() public override onlyOwner {
        revert("Disable function");
    }

    function addAdmins(address[]  calldata admins) external onlyOwner {
        for(uint256 i = 0 ; i < admins.length ; i++){
            if(admins[i] == address(0)) {
                continue ;
            }
            isAdmin[admins[i]] = true;
        }
    }

    function removeAdmins(address[] calldata admins) external onlyOwner {
        for(uint256 i = 0 ; i < admins.length ; i++){
            if(admins[i] == address(0)) {
                continue;
            }
            isAdmin[admins[i]] = false;
        }
    }

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "unauthorized");
        _;
    }

    modifier saleActive() {
        require(
            !isStopSale &&
                (end > 0 && block.timestamp < end && availableTokens > 0),
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
            isStopSale ||
                (end > 0 && (block.timestamp >= end || availableTokens == 0)),
            "Sale has NOT ended"
        );
        _;
    }
}
