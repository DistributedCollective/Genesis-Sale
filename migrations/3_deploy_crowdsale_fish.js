const CFISHToken = artifacts.require("CFISHToken");
const CrowdSaleFish = artifacts.require("CrowdSaleFish");

//Mainnet
const SovrynAddr = '0xC7A1637b37190a456b017897207bceb2A29f19b9';
const cfishAdmin = '0x04cb2eF013F866E9915016E44FE36218361C1F5a'; 

const NFTs = [
    '0xd9bbcd6e0ab105c83e2b5be0bbb9bb90ef963de7',
    '0x7806d3fedf9c9741041f5d70af5adf326705b03d',
    '0x857a62c9c0b6f1211e04275a1f0c5f26fce2021f'];
const Admins = [
    '0x8Eda3d549239D239c99d0daE672231A0B7e29458',
    '0x4193cF8c80a0A30218024670A1948A4558252940',
    '0x88E586b784B74f833E9bd605023474A39220fFd7',
    '0x5205501b988dd9b0b13b3Fa32Fa8c7dFf133A936',
    '0xcDf902Ba1919d275fD084D84CaaC276e890Fb2C6'];
    
//Testnet
/*const SovrynAddr = '0xE8276A1680CB970c2334B3201044Ddf7c492F52A';
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
*/

module.exports = async function (deployer) {
      CFISHTokenInstance = await deployToken(deployer);
      crowdsale = await deployCrowdsaleFISH(deployer, CFISHTokenInstance.address);
    //  mainnet
    // CFISHAddress = '0x0106F2fFBF6A4f5DEcE323d20E16E2037E732790';
    // crowdsale = await deployCrowdsaleFISH(deployer, CFISHAddress);
    
    await crowdsale.addAdmins(Admins);
    console.log("CrowdSale BTC Wallets admins set")
    
    await crowdsale.transferOwnership(cfishAdmin);
    console.log("crowdSale owner has changed to " + cfishAdmin);
    
   // await CFISHTokenInstance.setSaleAdmin(crowdsale.address);
   // console.log(
   //     "Token Balance of crowdsale smart contract: " +
   //      await CFISHTokenInstance.balanceOf(crowdsale.address));
   // crowdsale.start(86400*3, 50000, web3.utils.toWei('0.001', 'ether'), web3.utils.toWei('2000000', 'ether'));
}


async function deployToken(deployer){
    const totaltoken = web3.utils.toWei('420000000');
    await deployer.deploy(CFISHToken, totaltoken, cfishAdmin);
    let CFISHTokenInstance = await CFISHToken.deployed();
    CFISHAddress = await CFISHTokenInstance.address;
    console.log("CFISHAddress address: " + CFISHAddress);
    return CFISHTokenInstance;
}

async function deployCrowdsaleFISH(deployer, CFISHAddress){
    const maxpricelist = [
        web3.utils.toWei('2', 'ether'),
        web3.utils.toWei('0.1', 'ether'),
        web3.utils.toWei('0.03', 'ether')
    ];
    console.log(CFISHAddress + "  " + NFTs + "   " + maxpricelist + "   "+ SovrynAddr)
    await deployer.deploy(CrowdSaleFish, CFISHAddress, NFTs, maxpricelist,SovrynAddr);
    let crowdsale = await CrowdSaleFish.deployed();
    let crowdAddr = await crowdsale.address;
    console.log("CrowdSaleFish address: " + crowdAddr);
    return crowdsale;
}