const NFTMockSetup = artifacts.require("NFTMockSetup");
const CSOVToken = artifacts.require("CSOVToken");

//address should be in lower or upper case
//TODO use deployer address
const DEPLOYER = "0x4b0a9901f252046d8f2219c60f2ffe6822e991a8";
const HOLDERS = [
    DEPLOYER,
    DEPLOYER,
    DEPLOYER,
    DEPLOYER,
    DEPLOYER
];

module.exports = async function (deployer) {
    //deploy NFTMockSetup
    await deployer.deploy(NFTMockSetup, HOLDERS);
    let NFTMockSetupInstance = await NFTMockSetup.deployed();
    console.log(NFTMockSetupInstance.address);

    console.log(await NFTMockSetupInstance.holders(0));
    //reverts for some reason
    // await NFTMockSetupInstance.buildMockAndMint();

    //deploy CSOVToken
    await deployer.deploy(CSOVToken, 1000, false);
    let CSOVTokenInstance = await CSOVToken.deployed();
    console.log(CSOVTokenInstance.address);

    console.log(await CSOVTokenInstance.name());
    console.log(await CSOVTokenInstance.isSaleEnded());
    await CSOVTokenInstance.saleClosure(true);
    console.log(await CSOVTokenInstance.isSaleEnded());

};
