//location of the file should be in migrations folder for testnet
const NFTMockSetup = artifacts.require("NFTMockSetup");
const CSOVToken = artifacts.require("CSOVToken");
const CrowdSale = artifacts.require("CrowdSale");

//const SovrynAddr = "0xf259e48a5f28176c38fcf2d30c916bb0c25ca9ed";
const SovrynAddr = Object.keys(web3.currentProvider.wallets)[6];
let CSOVAddress;
const Holder1 = Object.keys(web3.currentProvider.wallets)[0];
const Holder2 = Object.keys(web3.currentProvider.wallets)[1];
const Holder3 = Object.keys(web3.currentProvider.wallets)[2];
const Holder4 = Object.keys(web3.currentProvider.wallets)[3];
const Holder5 = Object.keys(web3.currentProvider.wallets)[4];
//const Holder1 = "0x8740653898204E23129aE6D3E83908B0C80bBB88";
//const Holder2 = "0xD428B98b65f1F607cCFfd5428de0B2B5fb7D0219";
//const Holder3 = "0xe04c7301eB08b4cbA478A2EaEE48dBEa7a9138dD";
//const Holder4 = "0xA07A412B61D799Ac034C978015541669cA55018B";
//const Holder5 = "0x6aB16014e35b6f805E75963AeE1bD72a4E2Bd99f";
const HOLDERS = 
    [Holder1,Holder2,Holder3,Holder4,Holder5];
let NFAddr = [];
const owner = Object.keys(web3.currentProvider.wallets)[5]
console.log("owner is account[5]: " + owner);
console.log("SovrynAddr is account[6]: " + SovrynAddr);

module.exports = async function (deployer) {
//*** Stage 0:
//*** START deploy NFTMockSetup
    await deployer.deploy(NFTMockSetup, HOLDERS, {from: owner});
    let NFTMockSetupInstance = await NFTMockSetup.deployed();
    let i;
    for(i=0; i < 5; i++){
        await NFTMockSetupInstance.buildNFT(i, {from: owner});
        NFAddr[i] = await NFTMockSetupInstance.NFAdress(i);
    }
    await NFTMockSetupInstance.mintNFT({from: owner});
    console.log(NFAddr);
//*** END deploy NFTMockSetup***

//*** Stage 1:
//*** START deploy CSOVToken
    const totaltoken = web3.utils.toWei('300');
    await deployer.deploy(CSOVToken, totaltoken, {from: owner});
    let CSOVTokenInstance = await CSOVToken.deployed();
    CSOVAddress = await CSOVTokenInstance.address;
    console.log("CSOVAddress address: " + CSOVAddress);
//*** END deploy CSOVToken***/
    
// If deployed in stages, need to add manually 
// CSOVAddress = "0xfc34B7db7AA799373905293056B7A278756e4D4c";
//    NFAddr = [                                              
//        "0xD970F5D91290046Fe02D955B9e0f587Db7C0644D",
//        "0x84bAB288DB2fc1eEEEB26B623312E9FAed80766E",
//        "0x942126ECDD27f546EcEF1f67F907f11c08aabE13",
//        "0x70B53d2Ca943a1e57D1E47a98DbF2f259Eed0E2d",
//        "0x62947d617A77891a7143f87794cd9A71822Bb310" 
//      ]   ;                                           
    
//*** Stage 2:
//*** START deploy CrowdSale
    const maxpricelist = [
        1500000000000000,
        1000000000000000,
        700000000000000,
        600000000000000,
        500000000000000
    ];
    console.log("maxpricelist is RBTC: [0.0015,0.001,0.0007,0.0006,0.0005]")
    console.log(CSOVAddress + "  " + NFAddr + "   " + maxpricelist + "   "+ SovrynAddr)
   await deployer.deploy(CrowdSale,CSOVAddress, NFAddr,maxpricelist,SovrynAddr, {from: owner});
    let crowdsale = await CrowdSale.deployed();
    let crowdAddr = await crowdsale.address;
    console.log("CrowdSale address: " + crowdAddr);
//*** END deploy CrowdSale

//*** Stage 3:
//*** START setsale admin to crowdsale smartcontract
    await CSOVTokenInstance.setSaleAdmin(crowdAddr, {from: owner});
    console.log(
        "Token Balance of crowdsale smart contract: " +
         await CSOVTokenInstance.balanceOf(crowdAddr));
//*** END setsale admin to crowdsale smartcontract
};