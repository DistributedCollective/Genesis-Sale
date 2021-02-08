const PostCSOV = artifacts.require('post/PostCSOV.sol');
const CSOVToken = artifacts.require('main/CSOVToken.sol');

//const csovAdmin = '0x763e73385c790f2fe2354d877ff98431ee586e4e'; 
const csovAdmin = '0xD428B98b65f1F607cCFfd5428de0B2B5fb7D0219'; 
const pricsSats = '2500';
    

module.exports = async function (deployer) {
      CSOVTokenInstance1 = await deployToken(deployer);
      CSOVTokenInstance2 = await deployToken(deployer);
      const addr1 = CSOVTokenInstance1.address;
      const addr2 = CSOVTokenInstance2.address;

      postcsov = await deploypostCSOV(deployer, [addr1 , addr2]);
      console.log("CSOVTokenInstance1: " + addr1 + "   " + "CSOVTokenInstance2: " + addr2);

}

async function deployToken(deployer){
    const totaltoken = web3.utils.toWei('2000000');
    await deployer.deploy(CSOVToken, totaltoken, csovAdmin);
    let CSOVTokenInstance = await CSOVToken.deployed();
    CSOVAddress = await CSOVTokenInstance.address;
    console.log("CSOVAddress address: " + CSOVAddress);
    return CSOVTokenInstance;
}

async function deploypostCSOV(deployer, CSOVAddress){
    await deployer.deploy(PostCSOV,CSOVAddress, pricsSats);
    let postcsov = await PostCSOV.deployed();
    let postcsovAddr = await postcsov.address;
    console.log("PostCSOV address: " + postcsovAddr);
    return postcsov;
}