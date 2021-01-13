const CSOVToken = artifacts.require("CSOVToken");
const CrowdSale = artifacts.require("CrowdSale");

const SovrynAddr = '0xE8276A1680CB970c2334B3201044Ddf7c492F52A';
//const adminWallet = '0xE8276A1680CB970c2334B3201044Ddf7c492F52A';
const csovAdmin = '0x0E9fb5B82bD46320d811104542EEE4209536978a'; 
const NFTs = ['0x78c0D49d003bf0A88EA6dF729B7a2AD133B9Ae25','0x420fECFda0975c49Fd0026f076B302064ED9C6Ff','0xC5452Dbb2E3956C1161cB9C2d6DB53C2b60E7805'];
/// Need tp update BTC wallet Admins 
const Admins = ['0xE8276A1680CB970c2334B3201044Ddf7c492F52A','0x0E9fb5B82bD46320d811104542EEE4209536978a'];
module.exports = async function (deployer) {
    CSOVTokenInstance = await deployToken(deployer);
    crowdsale = await deployCrowdsale(deployer, CSOVTokenInstance.address);
    
    await crowdsale.addAdmins(Admins);
    console.log("CrowdSale BTC Wallets admins set")
    
    await crowdsale.transferOwnership(csovAdmin);
    console.log("crowdSale owner has changed to " + csovAdmin);
    
    // await CSOVTokenInstance.setSaleAdmin(crowdsale.address);
   // console.log(
   //     "Token Balance of crowdsale smart contract: " +
   //      await CSOVTokenInstance.balanceOf(crowdsale.address));
   // crowdsale.start(86400*3, 50000, web3.utils.toWei('0.001', 'ether'), web3.utils.toWei('2000000', 'ether'));
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
    //console.log(CSOVAddress + "  " + NFTs + "   " + maxpricelist + "   "+ SovrynAddr+ "   "+ adminWallet)
    console.log(CSOVAddress + "  " + NFTs + "   " + maxpricelist + "   "+ SovrynAddr)
    await deployer.deploy(CrowdSale,CSOVAddress, NFTs, maxpricelist,SovrynAddr);
    let crowdsale = await CrowdSale.deployed();
    let crowdAddr = await crowdsale.address;
    console.log("CrowdSale address: " + crowdAddr);
    return crowdsale;
}