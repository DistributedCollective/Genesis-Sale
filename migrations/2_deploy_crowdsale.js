const CSOVToken = artifacts.require("CSOVToken");
const CrowdSale = artifacts.require("CrowdSale");

const SovrynAddr = '0xE8276A1680CB970c2334B3201044Ddf7c492F52A';
const csovAdmin = '0x0E9fb5B82bD46320d811104542EEE4209536978a'; 
const NFTs = [
    '0x78c0D49d003bf0A88EA6dF729B7a2AD133B9Ae25',
    '0x420fECFda0975c49Fd0026f076B302064ED9C6Ff',
    '0xC5452Dbb2E3956C1161cB9C2d6DB53C2b60E7805'];
const Admins = [
    '0xE8276A1680CB970c2334B3201044Ddf7c492F52A',
    '0x764330A5A9e4018FcDb4A99266EdCDb274fc26d4',
    '0x1A548749f49eA840Dc4fb8986E9930e396567a44',
    '0xe1110C9595444f0Bc6cB2f8Ef214ECc97E5e15FE',
    '0x125253925D7Ed9fC6AF5936265D9aE6f10568500',
    '0x63276e0E82BF1C5a7642EF6144e00cD285023d2b'];

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
    console.log(CSOVAddress + "  " + NFTs + "   " + maxpricelist + "   "+ SovrynAddr)
    await deployer.deploy(CrowdSale,CSOVAddress, NFTs, maxpricelist,SovrynAddr);
    let crowdsale = await CrowdSale.deployed();
    let crowdAddr = await crowdsale.address;
    console.log("CrowdSale address: " + crowdAddr);
    return crowdsale;
}