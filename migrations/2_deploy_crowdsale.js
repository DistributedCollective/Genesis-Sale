//location of the file should be in migrations folder for testnet only
const NFTMockSetup = artifacts.require("NFTMockSetup");
const CSOVToken = artifacts.require("CSOVToken");
const CrowdSale = artifacts.require("CrowdSale");

// For RSK
////const SovrynAddr = "0xf259e48a5f28176c38fcf2d30c916bb0c25ca9ed";
const SovrynAddr = Object.keys(web3.currentProvider.wallets)[6];
let CSOVAddress;
const Holder1 = Object.keys(web3.currentProvider.wallets)[0];
const Holder2 = Object.keys(web3.currentProvider.wallets)[1];
const Holder3 = Object.keys(web3.currentProvider.wallets)[2];
const Holder4 = Object.keys(web3.currentProvider.wallets)[3];
const Holder5 = Object.keys(web3.currentProvider.wallets)[4];
const HOLDERS =     [Holder1,Holder2,Holder3,Holder4,Holder5];

//const Holder1 = "0x8740653898204E23129aE6D3E83908B0C80bBB88";
//const Holder2 = "0xD428B98b65f1F607cCFfd5428de0B2B5fb7D0219";
//const Holder3 = "0xe04c7301eB08b4cbA478A2EaEE48dBEa7a9138dD";
//const Holder4 = "0xA07A412B61D799Ac034C978015541669cA55018B";
//const Holder5 = "0x6aB16014e35b6f805E75963AeE1bD72a4E2Bd99f";


let NFAddr = [];
const owner = Object.keys(web3.currentProvider.wallets)[5]
console.log("owner is account[5]: " + owner);
console.log("SovrynAddr is account[6]: " + SovrynAddr);
//console.log("HOLDERS accounts: " + HOLDERS);

// For Ropsten
/*module.exports = async function (deployer, _network, accounts) {
    const Holder0 = accounts[0];
    const Holder1 = accounts[1];
    const Holder2 = accounts[2];
    const Holder3 = accounts[3];
    const Holder4 = accounts[4];
    const owner = accounts[5];
    const SovrynAddr = accounts[6];
    console.log("owner is accounts[5]: " + owner);
    console.log("SovrynAddr is accounts[6]: " + SovrynAddr);
    const HOLDERS = 
    [Holder0,Holder1,Holder2,Holder3,Holder4];
    console.log("HOLDERS accounts: " + HOLDERS);
    let NFAddr = [];
*//////////////////////////

// For RSK
module.exports = async function (deployer) {

    //
//*** Stage 0:
//*** START deploy NFTMockSetup
    await deployer.deploy(NFTMockSetup, HOLDERS, {from: owner});
    let NFTMockSetupInstance = await NFTMockSetup.deployed();
    let i;
    for(i=0; i < 3; i++){
        await NFTMockSetupInstance.buildNFT(i, {from: owner});
        NFAddr[i] = await NFTMockSetupInstance.NFAdress(i);
    }
    await NFTMockSetupInstance.mintNFT({from: owner});
    //const testAddr = "0x6B619c5a0d6a6A23E9cA106930B777310C23D0dA";
    //await NFTMockSetupInstance.mintNFTHolder(testAddr, 0, {from: owner});
    //await NFTMockSetupInstance.mintNFTHolder(testAddr, 2, {from: owner});
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
/*    
// If deployed in stages, need to add manually 
// CSOVAddress = "0xfc34B7db7AA799373905293056B7A278756e4D4c";
    NFAddr = [                                              
        "0xf26480A98200aa686f0BD1AF7584f1a1d08e585f",
        "0xd796cBe78700CDdabbD602Cc0e8B92c38009Da0b",
        "0x2Eb7A98665dcf6a07C3C71AA28C6c26d5Ec7d0aF",
        "0xdC69d28bD24099E805B57b8f5AB1b7D10960a64e",
        "0x62645CF052f67CdcfF5c386888be5156f0342cB9" 
      ]   ;                                           
*/

 //*** Stage 2:
//*** START deploy CrowdSale
    const maxpricelist = [
        1500000000000000,
        1000000000000000,
        500000000000000
    ];
    console.log("maxpricelist is RBTC: [0.0015,0.001,0.0005]")
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
