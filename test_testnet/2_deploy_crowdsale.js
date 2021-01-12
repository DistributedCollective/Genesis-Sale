const CSOVToken = artifacts.require("CSOVToken");
const CrowdSale = artifacts.require("CrowdSale");

const SovrynAddr = '0x7BE508451Cd748Ba55dcBE75c8067f9420909b49';
const adminWallet = '0x764330A5A9e4018FcDb4A99266EdCDb274fc26d4';
const csovAdmin = '0x764330A5A9e4018FcDb4A99266EdCDb274fc26d4'; /// Need to Update this address
const NFTs = ['0x78c0D49d003bf0A88EA6dF729B7a2AD133B9Ae25','0x420fECFda0975c49Fd0026f076B302064ED9C6Ff','0xC5452Dbb2E3956C1161cB9C2d6DB53C2b60E7805'];

module.exports = async function (deployer) {
    CSOVTokenInstance = await deployToken(deployer);
    crowdsale = await deployCrowdsale(deployer, CSOVTokenInstance.address);
    await CSOVTokenInstance.setSaleAdmin(crowdsale.address);
    console.log(
        "Token Balance of crowdsale smart contract: " +
         await CSOVTokenInstance.balanceOf(crowdsale.address));
    crowdsale.start(86400*3, 50000, web3.utils.toWei('0.001', 'ether'), web3.utils.toWei('2000000', 'ether'));
}

async function deployToken(deployer){
    const totaltoken = web3.utils.toWei('2000000');
    await deployer.deploy(CSOVToken, totaltoken, csovAdmin);
    let CSOVTokenInstance = await CSOVToken.deployed();
    CSOVAddress = await CSOVTokenInstance.address;
    console.log("CSOVAddress address: " + CSOVAddress);
    return CSOVTokenInstance;
}

async function deployCrowdsale(deployer, CSOVAddress){
    const maxpricelist = [
        web3.utils.toWei('2', 'ether'),
        web3.utils.toWei('0.1', 'ether'),
        web3.utils.toWei('0.03', 'ether')
    ];
    console.log(CSOVAddress + "  " + NFTs + "   " + maxpricelist + "   "+ SovrynAddr+ "   "+ adminWallet)
    await deployer.deploy(CrowdSale,CSOVAddress, NFTs, maxpricelist,SovrynAddr,adminWallet);
    let crowdsale = await CrowdSale.deployed();
    let crowdAddr = await crowdsale.address;
    console.log("CrowdSale address: " + crowdAddr);
    return crowdsale;
}