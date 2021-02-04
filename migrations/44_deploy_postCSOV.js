const PostCSOV = artifacts.require('post/PostCSOV.sol');
const CSOVToken = artifacts.require('main/CSOVToken.sol');

const csovAdmin = '0x763e73385c790f2fe2354d877ff98431ee586e4e'; 
const pricsSats = '2500';
    
module.exports = async function (deployer) {
      CSOVTokenInstance = await deployToken(deployer);
      postcsov = await deploypostCSOV(deployer, CSOVTokenInstance.address);
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
    console.log("CrowdSale address: " + postcsovAddr);
    return postcsov;
}